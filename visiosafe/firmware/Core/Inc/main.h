#ifndef __MAIN_H
#define __MAIN_H

#include "stm32f4xx.h"
#include "stm32f4xx_hal.h"
#include "sensors.h"
#include "wifi.h"

// LED Configuration
#define LED_PIN         GPIO_PIN_13
#define LED_PORT        GPIOC
#define LED_ON()        HAL_GPIO_WritePin(LED_PORT, LED_PIN, GPIO_PIN_SET)
#define LED_OFF()       HAL_GPIO_WritePin(LED_PORT, LED_PIN, GPIO_PIN_RESET)
#define LED_TOGGLE()    HAL_GPIO_TogglePin(LED_PORT, LED_PIN)

void SystemClock_Config(void);
void GPIO_Init(void);
void UART1_Init(void);
void Error_Handler(void);

#endif /* __MAIN_H */