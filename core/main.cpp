#include <WiFi.h>
#include <HTTPClient.h>
/************************************************
 * Wi-Fi configuration
 ************************************************/
const char* WIFI_SSID = "Muzaffar";
const char* WIFI_PASS = "muzaffar01";
const char* SERVER_URL = "https://iot.jprq.live/api/v1/score";
/************************************************
 * LED1 matrix pin mapping (DO NOT CHANGE)
 ************************************************/
const int ROW_PINS[8] = {21,22,23,25,26,27,32,33};
const int COL_PINS[8] = {4,5,13,14,16,17,18,19};
/************************************************
 * Buttons & Buzzer (DO NOT CHANGE)
 ************************************************/
const int BTN_LEFT_PIN = 34;
const int BTN_RIGHT_PIN = 35;
const int BTN_START_PIN = 12;
const int BUZZER_PIN = 15;
/************************************************
 * LED matrix polarity
 ************************************************/
const bool ROW_ACTIVE_HIGH = true;
const bool COL_ACTIVE_HIGH = false;
inline int rowOn() { return ROW_ACTIVE_HIGH ? HIGH : LOW; }
inline int rowOff() { return ROW_ACTIVE_HIGH ? LOW : HIGH; }
inline int colOn() { return COL_ACTIVE_HIGH ? HIGH : LOW; }
inline int colOff() { return COL_ACTIVE_HIGH ? LOW : HIGH; }
/************************************************
 * Display buffer + refresh
 ************************************************/
bool display[8][8];
int currentRow = 0;
unsigned long lastRefresh = 0;
const unsigned long REFRESH_US = 1000;
/************************************************
 * Game state
 ************************************************/
struct Point { int x, y; };
void deathAnimation(Point head);
void showScoreScrolling(unsigned long s);
Point ball;
int paddleX = 3;
int ballDirX = 0;
int ballDirY = 1;
unsigned long score = 0;
bool isGameOver = false;
unsigned long lastTick = 0;
unsigned long tickSpeed = 350;
/************************************************
 * Wi-Fi helpers
 ************************************************/
void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(100);
    Serial.print(".");
  }
  Serial.println();
}
void sendScore(unsigned long s) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"score\":" + String(s) + "}";
  http.POST(payload);
  http.end();
}
/************************************************
 * Display helpers
 ************************************************/
void clearDisplay() {
  for (int r=0;r<8;r++)
    for (int c=0;c<8;c++)
      display[r][c] = false;
}
void setPixel(int x,int y,bool on) {
  if(x<0||x>7||y<0||y>7) return;
  display[y][x] = on;
}
void refreshDisplay() {
  if (micros() - lastRefresh < REFRESH_US) return;
  lastRefresh = micros();
  for(int r=0;r<8;r++) digitalWrite(ROW_PINS[r], rowOff());
  for(int c=0;c<8;c++)
    digitalWrite(COL_PINS[c], display[currentRow][c] ? colOn() : colOff());
  digitalWrite(ROW_PINS[currentRow], rowOn());
  currentRow = (currentRow+1)%8;
}
/************************************************
 * Input
 ************************************************/
bool buttonPressed(int pin){ return digitalRead(pin)==LOW; }
void readInput() {
  if (isGameOver && digitalRead(BTN_START_PIN) == LOW) {
    delay(150);
    resetGame();
  }

  static unsigned long lastSample = 0;
  unsigned long now = millis();
  if (now - lastSample < 10) return;
  lastSample = now;

  bool leftNow = digitalRead(BTN_LEFT_PIN);
  bool rightNow = digitalRead(BTN_RIGHT_PIN);

  static int leftCount = 0;
  static bool leftPressed = false;
  if (leftNow == LOW) {
    leftCount++;
  } else {
    leftCount = 0;
  }
  if (leftCount >= 5) {
    if (!leftPressed) {
      if (paddleX > 1) paddleX--;
      leftPressed = true;
    }
  } else {
    leftPressed = false;
  }


  static int rightCount = 0;
  static bool rightPressed = false;
  if (rightNow == LOW) {
    rightCount++;
  } else {
    rightCount = 0;
  }
  if (rightCount >= 5) {
    if (!rightPressed) {
      if (paddleX < 6) paddleX++;
      rightPressed = true;
    }
  } else {
    rightPressed = false;
  }
}
/************************************************
 * Game logic
 ************************************************/
void resetGame() {
  paddleX = 3;
  ball = {random(0,8), 0};
  ballDirX = 0;
  ballDirY = 1;
  score = 0;
  isGameOver = false;
  tickSpeed = 350;
  clearDisplay();
}
void updateGame() {
  if (millis() - lastTick < tickSpeed) return;
  lastTick = millis();
  if(isGameOver) return;
  ball.x += ballDirX;
  if (ball.x < 0) {
    ball.x = 0;
    ballDirX *= -1;
  }
  if (ball.x > 7) {
    ball.x = 7;
    ballDirX *= -1;
  }
  ball.y += ballDirY;
  if (ball.y < 0) {
    ball.y = 0;
    ballDirY *= -1;
  }
  if(ball.y >= 7){
    if(ball.x >= paddleX-1 && ball.x <= paddleX+1){
      score++;
      if(tickSpeed>60) tickSpeed -= 10;
      digitalWrite(BUZZER_PIN,HIGH); delay(40); digitalWrite(BUZZER_PIN,LOW);
      ball.y = 6;
      ballDirY = -1;
      ballDirX = ball.x - paddleX;
    } else {
      isGameOver = true;
      digitalWrite(BUZZER_PIN,HIGH); delay(120); digitalWrite(BUZZER_PIN,LOW);
      deathAnimation(ball);
      sendScore(score);
      showScoreScrolling(score);
    }
  }
}
/************************************************
 * Death animation & score
 ************************************************/
void deathAnimation(Point head) {
  for(int r=0;r<6;r++){
    clearDisplay();
    for(int y=0;y<8;y++)
      for(int x=0;x<8;x++)
        if(abs(x-head.x)+abs(y-head.y)==r) display[y][x]=true;
    unsigned long t=millis();
    while(millis()-t<80) refreshDisplay();
  }
  for(int i=0;i<3;i++){
    for(int y=0;y<8;y++) for(int x=0;x<8;x++) display[y][x]=true;
    unsigned long t=millis();
    while(millis()-t<100) refreshDisplay();
    clearDisplay();
    t=millis();
    while(millis()-t<100) refreshDisplay();
  }
}
const byte font[10][5]={{0x1E,0x21,0x21,0x21,0x1E},{0x00,0x22,0x3F,0x20,0x00},{0x32,0x29,0x29,0x29,0x26},{0x12,0x21,0x25,0x25,0x1A},{0x0C,0x0A,0x09,0x3F,0x08},{0x17,0x25,0x25,0x25,0x19},{0x1E,0x25,0x25,0x25,0x18},{0x01,0x01,0x39,0x05,0x03},{0x1A,0x25,0x25,0x25,0x1A},{0x06,0x29,0x29,0x29,0x1E}};
void showScoreScrolling(unsigned long s) {
  char buf[16];
  snprintf(buf, 16, "%lu", s);
  String str(buf);
  int total = str.length() * 6;
  for (int sh = 8; sh > -total; sh--) {
    clearDisplay();
    int cx = sh;
    for (int k = 0; k < str.length(); k++) {
      int d = str[k] - '0';
      for (int c = 0; c < 5; c++) {
        byte bits = font[d][c];
        for (int r = 0; r < 7; r++)
          if (bits & (1 << (6 - r))) {
            int x = cx + c;
            int y = 6 - r;
            if (x >= 0 && x < 8 && y >= 0 && y < 8)
              display[y][x] = true;
          }
      }
      cx+=6;
    }
    unsigned long t=millis();
    while(millis()-t<120) refreshDisplay();
  }
}
/************************************************
 * Setup & Loop
 ************************************************/
void setup() {
  Serial.begin(115200);
  randomSeed(esp_random());
  for(int r:ROW_PINS) pinMode(r,OUTPUT);
  for(int c:COL_PINS) pinMode(c,OUTPUT);
  pinMode(BUZZER_PIN,OUTPUT);
  pinMode(BTN_LEFT_PIN,INPUT_PULLUP);
  pinMode(BTN_RIGHT_PIN,INPUT_PULLUP);
  pinMode(BTN_START_PIN,INPUT_PULLUP);
  connectWiFi();
  resetGame();
}
void loop() {
  refreshDisplay();
  readInput();
  updateGame();
  // Always redraw using latest paddle position
  clearDisplay();
  setPixel(ball.x, ball.y, true);
  setPixel(paddleX-1,7,true);
  setPixel(paddleX,7,true);
  setPixel(paddleX+1,7,true);
}
