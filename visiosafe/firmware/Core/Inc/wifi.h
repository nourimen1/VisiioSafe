#ifndef __WIFI_H
#define __WIFI_H

#include "main.h"

// WiFi Configuration
#define WIFI_SSID       "TT_A008"
#define WIFI_PASSWORD   "uuw97lp3tz"
#define SERVER_IP       "192.168.1.17"
#define SERVER_PORT     "5000"
#define ENVIRONMENT_ID  "1"
#define DEVICE_TOKEN    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

extern UART_HandleTypeDef huart1;

bool WIFI_Init(void);
bool WIFI_Send_Alert(void);

#endif /* __WIFI_H */