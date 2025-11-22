# 📱 Finding Your Computer's IP Address

## For Physical Device Testing (Expo Go)

When using Expo Go on a physical device, you need to use your **computer's local IP address** instead of `localhost`.

## 🔍 Find Your IP Address

### **Windows:**
```bash
ipconfig
```
Look for **IPv4 Address** under your active network adapter (usually Wi-Fi or Ethernet).

Example output:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### **Mac/Linux:**
```bash
ifconfig
```
Look for **inet** under your active network adapter.

Example output:
```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST>
    inet 192.168.1.100 netmask 0xffffff00
```

## 📝 Update app.json

Once you have your IP (e.g., `192.168.1.100`), update `app.json`:

```json
"apiHost": "192.168.1.100"
```

## ✅ Quick Steps

1. **Find your IP:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. **Update app.json:**
   - Change `"apiHost": "localhost"` to `"apiHost": "YOUR_IP"`

3. **Restart Expo:**
   - Stop Expo (Ctrl+C)
   - Run `npx expo start` again

4. **Test:**
   - Try signup again
   - Should connect to backend now

## 🔒 Important

- **Both devices must be on the same WiFi network**
- **Backend must be running** on your computer
- **Firewall** might block connections - allow port 5000 if needed

