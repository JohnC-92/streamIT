## StreamIT
![](https://i.imgur.com/3caehri.jpg)

- StreamIT, the streaming platform for both streamers and viewers. 
- Streamers, welcome to showcase yourself in diverse categories and contents.
- Viewers, just sit back, relax, get entertained after a weary work day or interact with your favourite streamer.
- Start streaming today and be the next billionaire streamer in 2020!

Website URL: https://streamit.website

## Test Account
    Email: yuyan@mail.com
    Password: yuyan.123#
     
## Test Credit Card
    Card Number: 4242 4242 4242 4242
    Expiry Data: Any number
    CVC: Any number
    Post no.: Any number

## Table of Contents

- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Main Features](#Main-Features)
- [Streaming Demo](#Streaming-Demo)
- [Video Pipeline](#Video-Pipeline-for-VOD-And-Live-Streaming)
- [Server Bandwidth Usage](#Server-Bandwidth-Usage-Analysis)
- [Contact](#Contact)

## Technologies

### Backend

- AWS EC2
- Node.js
- Express.js

### Front-End
- HTML
- CSS
- Javascript
- EJS

### Cloud Services (AWS)
- AWS S3
- AWS RDS
- AWS Cloudfront
<!-- - AWS Elastic Load Balancer -->

### Database
- MySQL

### Networking
- Streaming Server: Node Media Server
- Streaming Protocol: RTMP & HTTP-flv
- Network Redirecting: Nginx

### Tools
- Media conversion: FFmpeg
- Test: Mocha, Chai
<!-- - CI/CD: Docker, Jenkins -->

### Others
- User Login: Facebook SDK
- Payment/Donation: Stripe SDK

## Architecture
![](https://i.imgur.com/ByAECvk.png)

## Database Schema
![](https://i.imgur.com/OnErgIb.png)

## Main Features

- Streaming:
    - Stream and create your own live content to entertain others
- Video on Demand (VOD):
    - VOD is uploaded immediately after every stream ends
- Follow Feature:
    - Follow your favourite streamer and get informed if they are online on the sidebar
- Donate Feature:
    - Support your favourite streamer by donating to them
- Chatroom:
    - Interact with your favourite streamer via live chat

### Streaming Demo
1. Sign up and create an account
2. Right click on member icon and go to profile page to acquire stream key
3. Copy stream key
4. Install OBS and open up OBS
5. Set up Camera and streaming settings
6. Type in stream key in settings and set streaming url to rtmp://streamit.website:1935/live
7. Happy streaming

## Video Pipeline for VOD And Live Streaming
![](https://i.imgur.com/YSEn9Oo.png)

## Server Bandwidth Usage Analysis with/without CDN

### Media Server Specs (AWS EC2): 
    OS:	 x64_linux_4.14.181-142.260.amzn2.x86_64
    CPU:	 1 x Intel(R) Xeon(R) CPU E5-2676 v3     @ 2.40GHz
    Memory:	 983 MB
    Node.js: v14.5.0

### Start of Node Media Server - 0 Viewer
![](https://i.imgur.com/GkI7hxm.png)

    - 0 HTTP request
    - Server output bandwidth = 6 mbps.

### Node Media Server without AWS Cloudfront(CDN) - 25 Viewers
![](https://i.imgur.com/WH6ogW4.png)

    - 25 HTTP requests (1 request for every viewer)
    - Server output bandwidth = 200+ mbps.

### Node Media Server with AWS Cloudfront(CDN) - 25 Viewers
![](https://i.imgur.com/G4ST7eg.png)

    - 1 HTTP requests 
    - Server bandwidth = stable 10 mbps.

### Observation
- As we can see from the bandwidth usage, without using CDN all viewer will request video from server thus increasing server burden on uploading bandwidth.
- By using AWS Cloudfront(CDN), it effectively reduced server bandwidth by making only one request to server and serve them through it's own CDN servers.

## Contact
Email: xtremeboost92@gmail.com