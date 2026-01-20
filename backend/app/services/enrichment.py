
import whois
import socket
import requests

def get_enhanced_url_data(url: str):
    domain = url.replace("https://", "").replace("http://", "").split('/')[0]
    
    data = {
        "domain_age": "Unknown",
        "ip_address": "Unknown",
        "server_location": "Unknown",
        "asn": "Unknown"
    }

    # 1. WHOIS Lookup
    try:
        w = whois.whois(domain)
        if w.creation_date:
            creation = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
            data["domain_age"] = str(creation)
    except Exception:
        pass

    # 2. DNS / GeoIP
    try:
        ip = socket.gethostbyname(domain)
        data["ip_address"] = ip
        
        # Simple IP-API (free) for geolocation
        geo_res = requests.get(f"http://ip-api.com/json/{ip}?fields=country,isp,lat,lon").json()
        if geo_res['status'] == 'success':
            data["server_location"] = geo_res['country']
            data["asn"] = geo_res['isp']
            data["lat"] = geo_res['lat']
            data["lon"] = geo_res['lon']
    except Exception:
        pass
        
    return data
