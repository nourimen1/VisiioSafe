#include "wifi.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

static bool WIFI_Send_Command(const char* cmd, const char* expected, uint32_t timeout);
static bool WIFI_Wait_For_Response(const char* expected, uint32_t timeout);

bool WIFI_Init(void) {
    // Reset module
    if(!WIFI_Send_Command("AT+RST\r\n", "ready", 5000)) return false;
    HAL_Delay(1000);
    
    // Test communication
    if(!WIFI_Send_Command("AT\r\n", "OK", 1000)) return false;
    
    // Set WiFi mode
    if(!WIFI_Send_Command("AT+CWMODE=1\r\n", "OK", 2000)) return false;
    
    // Connect to AP
    char cmd[128];
    snprintf(cmd, sizeof(cmd), "AT+CWJAP=\"%s\",\"%s\"\r\n", WIFI_SSID, WIFI_PASSWORD);
    if(!WIFI_Send_Command(cmd, "OK", 10000)) return false;
    
    // Set single connection
    return WIFI_Send_Command("AT+CIPMUX=0\r\n", "OK", 1000);
}

bool WIFI_Send_Alert(void) {
    char json[128];
    snprintf(json, sizeof(json), 
        "{\"sensor\":\"PIR\",\"environment_id\":%s}", 
        ENVIRONMENT_ID);

    char http_req[256];
    snprintf(http_req, sizeof(http_req),
        "POST /alert HTTP/1.1\r\n"
        "Host: %s:%s\r\n"
        "Authorization: Bearer %s\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n\r\n"
        "%s",
        SERVER_IP, SERVER_PORT, DEVICE_TOKEN, strlen(json), json);

    char cmd[128];
    
    // Start TCP connection
    snprintf(cmd, sizeof(cmd), "AT+CIPSTART=\"TCP\",\"%s\",%s\r\n", SERVER_IP, SERVER_PORT);
    if(!WIFI_Send_Command(cmd, "CONNECT", 5000)) {
        WIFI_Send_Command("AT+CIPCLOSE\r\n", "CLOSED", 1000);
        return false;
    }

    // Send data
    snprintf(cmd, sizeof(cmd), "AT+CIPSEND=%d\r\n", strlen(http_req));
    if(!WIFI_Send_Command(cmd, ">", 1000)) {
        WIFI_Send_Command("AT+CIPCLOSE\r\n", "CLOSED", 1000);
        return false;
    }
    
    // Send HTTP request
    if(!WIFI_Send_Command(http_req, "SEND OK", 2000)) {
        WIFI_Send_Command("AT+CIPCLOSE\r\n", "CLOSED", 1000);
        return false;
    }
    
    // Close connection
    return WIFI_Send_Command("AT+CIPCLOSE\r\n", "CLOSED", 1000);
}

static bool WIFI_Send_Command(const char* cmd, const char* expected, uint32_t timeout) {
    HAL_UART_Transmit(&huart1, (uint8_t*)cmd, strlen(cmd), HAL_MAX_DELAY);
    return WIFI_Wait_For_Response(expected, timeout);
}

static bool WIFI_Wait_For_Response(const char* expected, uint32_t timeout) {
    uint8_t buffer[256];
    uint32_t start = HAL_GetTick();
    uint32_t index = 0;
    
    while(HAL_GetTick() - start < timeout) {
        if(HAL_UART_Receive(&huart1, &buffer[index], 1, 100) == HAL_OK) {
            if(buffer[index] == '\n' || index == sizeof(buffer)-1) {
                buffer[index] = '\0';
                if(strstr((char*)buffer, expected) != NULL) {
                    return true;
                }
                index = 0;
            } else {
                index++;
            }
        }
    }
    return false;
}