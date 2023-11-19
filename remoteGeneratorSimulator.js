// This is a Node-RED function node to simulate a remote generator
// set default levels for different generator operating speeds
var 
    rpm0 = 0, rpm1 = 900, rpm2 = 1800, rpm3 = 2400, rpm4 = 3200, 
    current0 = 0, current1 = 0, current2 = 28, current3 = 36, current4 = 44,
    voltage0 = 0, voltage1 = 0, voltage2 = 240, voltage3 = 236, voltage4 = 230,
    oilP0 = 0; oilP1 = 140, oilP2 = 145, oilP3 = 150, oilP4 = 165,
    temp0 = 50, temp1 = 120, temp2 = 135, temp3 = 140, temp4 = 155,
    rssi0 = 45, rssi1 = 43, rssi2 = 38, rssi3 = 35, rssi4 = 32;
    
// vars to use in the calculations for state
var    
    rpm = 0,
    current = 0,
    voltage = 0,
    oilPressure = 0,
    temp = 0;
    
// vars that are not affected by state change
var
    fuel = 77,
    oil = 85,
    uptime = 1,
    rssi = 35;
    
// set time for each state to run
var
    ZeroTime = 4,
    OneTime = 4,
    TwoTime = 4,
    ThreeTime = 8,
    FourTime = 6;

// check for control conditions ...  

var alarm_count = flow.get("alarm_count");

if (flow.get("emergency_off") == 1){
    flow.set("gen_state", 0);
    flow.set("gen_count", 3);
    flow.set("emergency_off", 0);
}

if (flow.get("set_to_idle") == 1){
    flow.set("gen_state", 1);
    flow.set("gen_count", 3);
    flow.set("set_to_idle", 0);
}

if (flow.get("reset_controller") == 1){
    flow.set("gen_state", 0);
    flow.set("gen_count", 3);
    flow.set("reset_controller", 0);
}

if (flow.get("set_alarm_beacon") == 1 && flow.get("alarm_count") < 4){
    alarm_count++;
    flow.set("alarm_count", alarm_count);
} else {
    flow.set("set_alarm_beacon",0);
    flow.set("alarm_count", 0);  // alarm beacon duration "hard-set" here
}
    
    
// time flow variables to store time in each state
var count = flow.get("gen_count"),
    state = flow.get("gen_state"); 
    

//    ZeroTicks = flow.get("ZeroTicks"),
//    OneTicks = flow.get("OneTicks"),
//    TwoTicks = flow.get("TwoTicks"),
//    ThreeTicks = flow.get("ThreeTicks"),
//    FourTicks = flow.get("FourTicks"),
// flow variable to store which state is the generator in
   
   
//flow.set("emergency_off", off);
//flow.set("set_to_idle", idle);
//flow.set("reset_controller", reset);
//flow.set("set_alarm_beacon", alarm);
    
switch (state) {
  case 0: // off state
    rpm = rpm0 + Math.random() * 30; 
    current = current0 + Math.random() * 1; 
    voltage = voltage0 + Math.random() * 1; 
    oilPressure = oilP0 + Math.random() * 1; 
    temp = temp0 + Math.random() * 1;
    rssi = rssi0 + Math.random() * 1;
    count--;
    flow.set("gen_count", count);
    flow.set("ops_state", "Off_Line");
    break;
  case 1: // idle
    rpm = rpm1 + Math.random() * 30; 
    current = current1 + Math.random() * 1; 
    voltage = voltage1 + Math.random() * 1; 
    oilPressure = oilP1 + Math.random() * 1; 
    temp = temp1 + Math.random() * 1;
    rssi = rssi1 + Math.random() * 1;
    count--;
    flow.set("gen_count", count); 
    flow.set("ops_state", "Running");
    break;
  case 2: // low power
    rpm = rpm2 + Math.random() * 30; 
    current = current2 + Math.random() * 1; 
    voltage = voltage2 + Math.random() * 1; 
    oilPressure = oilP2 + Math.random() * 1; 
    temp = temp2 + Math.random() * 1;
    rssi = rssi2 + Math.random() * 1;
    count--;
    flow.set("gen_count", count);
    flow.set("ops_state", "Running");
    break;
  case 3: // med power
    rpm = rpm3 + Math.random() * 20; 
    current = current3 + Math.random() * 1; 
    voltage = voltage3 + Math.random() * 1; 
    oilPressure = oilP3 + Math.random() * 1; 
    temp = temp3 + Math.random() * 1;
    rssi = rssi3 + Math.random() * 1;
    count--;
    flow.set("gen_count", count);
    flow.set("ops_state", "Running");
    break; 
  case 4: // full power
    rpm = rpm4 + Math.random() * 30; 
    current = current4 + Math.random() * 1; 
    if (count==FourTime){
        current = current + 4;
    }
    voltage = voltage4 + Math.random() * 1; 
    oilPressure = oilP4 + Math.random() * 1; 
    temp = temp4 + Math.random() * 1;
    rssi = rssi4 + Math.random() * 1;
    count--;
    flow.set("gen_count", count);
    flow.set("ops_state", "Running");
    break;     
  default:
    break; 
}

fuel = Math.round((fuel + Math.random() * 2)*100)/100;
oil = Math.round((oil + Math.random() * 2)*100)/100;
uptime = uptime + 10;
rpm = Math.round(rpm * 100) / 100;
voltage = Math.round(voltage * 100) / 100;
current = Math.round(current * 100) / 100;
temp = Math.round(temp * 100) / 100;
rssi = Math.round(rssi * 100) / 100;
oilPressure = Math.round(oilPressure * 100) / 100;
rpm = Math.round(rpm * 100) / 100;
    

if (state==0 && count==0){
    flow.set("gen_state", 1);
    flow.set("gen_count", OneTime)
} else if 
    (state==1 && count==0){
    flow.set("gen_state", 2);
    flow.set("gen_count", TwoTime)
} else if 
    (state==2 && count==0){
    flow.set("gen_state", 3);
    flow.set("gen_count", ThreeTime)
} else if
    (state==3 && count==0){
    flow.set("gen_state", 4);
    flow.set("gen_count", FourTime)
} else if
    (state==4 && count==0){
    flow.set("gen_state", 2);
    flow.set("gen_count", TwoTime)
}
// var deviceType = "notSet";
// var deviceID = "notSet";
let message1 = {
   // deviceType: deviceType,
   // deviceID: deviceType,
    fuel: fuel,
    rpm: rpm,
    oil: oil,
    voltage: voltage,
    current: current,
    uptime: uptime, 
    temperature: temp,
    oil_pressure: oilPressure,
    rssi: rssi,
    ops_state: flow.get("ops_state"),
    state: flow.get("gen_state"),
    count: flow.get("gen_count"),
    alarm: flow.get("alarm_count"),
    ops: flow.get("ops_state")
}
var msg1 = {payload: message1, topic: "MQTT Data"};

let message2 = {
    off: flow.get("emergency_off"),
    idle: flow.get("set_to_idle"),
    reset: flow.get("reset_controller"),
    alarm: flow.get("set_alarm_beacon"),
    alarm_count: flow.get("alarm_count")
}
var msg2 = {payload: message2, topic: "Controls"};

return [msg1,msg2];