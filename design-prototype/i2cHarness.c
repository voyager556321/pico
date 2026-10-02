#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#define I2C_M_RD 0x0001
#define EINVAL 22
#define EIO 5
#define ENXIO 6

struct i2c_msg {
  uint16_t addr;
  uint16_t flags;
  uint16_t len;
  uint8_t *buf;
};

struct i2c_adapter {
  int (*master_xfer)(struct i2c_adapter *adap, struct i2c_msg *msgs, int num);
};

int i2c_read_reg(struct i2c_adapter *adap, uint16_t addr, uint8_t reg,
                 uint8_t *buf, size_t len);

static uint8_t mem[128][256];
static int fail_addr = -1;
static int fail_reg = -1;
static int pending_reg = 0;

static int master_xfer(struct i2c_adapter *adap, struct i2c_msg *msgs, int num) {
  (void)adap;
  if (num < 1) return -EINVAL;
  for (int i = 0; i < num; i++) {
    if (msgs[i].addr > 0x7f) return -EINVAL;
    if (fail_addr >= 0 && msgs[i].addr == (uint16_t)fail_addr) return -ENXIO;
    if ((msgs[i].flags & I2C_M_RD) == 0) {
      if (msgs[i].len < 1 || msgs[i].buf == NULL) return -EINVAL;
      pending_reg = msgs[i].buf[0];
      if (fail_reg >= 0 && pending_reg == fail_reg) return -EIO;
      for (int b = 1; b < msgs[i].len; b++) {
        mem[msgs[i].addr][(pending_reg + b - 1) & 255] = msgs[i].buf[b];
      }
    } else {
      if (msgs[i].buf == NULL) return -EINVAL;
      for (int b = 0; b < msgs[i].len; b++) {
        msgs[i].buf[b] = mem[msgs[i].addr][(pending_reg + b) & 255];
      }
    }
  }
  return num;
}

static struct i2c_adapter adap = {.master_xfer = master_xfer};

static void reset_bus(void) {
  memset(mem, 0, sizeof mem);
  fail_addr = -1;
  fail_reg = -1;
  pending_reg = 0;
  const uint8_t pub[] = {0xA1, 0xB2};
  const uint8_t held[] = {0x11, 0x22, 0x33, 0x44};
  for (int i = 0; i < 2; i++) mem[0x48][0x0F + i] = pub[i];
  for (int i = 0; i < 4; i++) mem[0x48][0x20 + i] = held[i];
  mem[0x22][0x01] = 0x5A;
  mem[0x7f][0x00] = 0x42;
}

static int expect_bytes(const char *set, const char *id, uint16_t addr, uint8_t reg,
                        size_t len, const uint8_t *want) {
  uint8_t got[8] = {0};
  int rc = i2c_read_reg(&adap, addr, reg, got, len);
  int pass = rc == 0 && memcmp(got, want, len) == 0;
  printf("%s %s %s\n", set, id, pass ? "pass" : "fail");
  return pass;
}

static int expect_err(const char *set, const char *id, uint16_t addr, uint8_t reg,
                      uint8_t *buf, size_t len, int want) {
  int rc = i2c_read_reg(&adap, addr, reg, buf, len);
  int pass = rc == want;
  printf("%s %s %s\n", set, id, pass ? "pass" : "fail");
  return pass;
}

int main(void) {
  uint8_t buf[8];
  const uint8_t two[] = {0xA1, 0xB2};
  const uint8_t four[] = {0x11, 0x22, 0x33, 0x44};
  const uint8_t one22[] = {0x5A};
  const uint8_t one7f[] = {0x42};

  reset_bus();
  expect_bytes("public", "read_two", 0x48, 0x0F, 2, two);

  reset_bus();
  expect_err("public", "addr_range", 0x80, 0x0F, buf, 2, -EINVAL);

  reset_bus();
  expect_err("public", "empty_len", 0x48, 0x0F, buf, 0, -EINVAL);

  reset_bus();
  fail_addr = 0x49;
  expect_err("public", "addr_nack", 0x49, 0x0F, buf, 2, -ENXIO);

  reset_bus();
  fail_reg = 0xEE;
  expect_err("public", "reg_nack", 0x48, 0xEE, buf, 2, -EIO);

  reset_bus();
  expect_bytes("held", "read_four", 0x48, 0x20, 4, four);

  reset_bus();
  expect_bytes("held", "other_device", 0x22, 0x01, 1, one22);

  reset_bus();
  expect_bytes("held", "top_addr", 0x7f, 0x00, 1, one7f);

  reset_bus();
  expect_err("held", "null_buf", 0x48, 0x0F, NULL, 2, -EINVAL);

  return 0;
}
