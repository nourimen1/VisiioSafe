#ifndef __SENSORS_H
#define __SENSORS_H

#include "main.h"

#define PIR_PIN         GPIO_PIN_0
#define PIR_PORT        GPIOA

void PIR_Init(void);
uint8_t PIR_Detect_Motion(void);

#endif /* __SENSORS_H */