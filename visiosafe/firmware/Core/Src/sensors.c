#include "sensors.h"

void PIR_Init(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    
    __HAL_RCC_GPIOA_CLK_ENABLE();
    
    GPIO_InitStruct.Pin = PIR_PIN;
    GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    HAL_GPIO_Init(PIR_PORT, &GPIO_InitStruct);
}

uint8_t PIR_Detect_Motion(void) {
    return HAL_GPIO_ReadPin(PIR_PORT, PIR_PIN);
}