import json
import requests
from bs4 import BeautifulSoup

BADGES = [
"https://www.credly.com/badges/5d3f2b7d-d16c-4138-94d5-099418588835/public_url",
"https://www.credly.com/badges/873303f9-176a-48e8-bb9d-a5664aee75ac/public_url",
"https://www.credly.com/badges/78a3a417-9217-45dd-8919-754853ba6f15/public_url",
"https://www.credly.com/badges/60a3e6a2-b322-46e8-9a99-f5ecdb2cd910/public_url",
"https://www.credly.com/badges/ee279fd4-78e2-493a-ab58-4e8f0e96740f/public_url",
"https://www.credly.com/badges/b89c3626-4b78-4db2-9bd4-9dadc595a83c/public_url",
"https://www.credly.com/badges/2eeb928f-2880-4618-9618-0c0540278717/public_url",
"https://www.credly.com/badges/b0013760-4c7f-4320-90ff-42be2f42279d/public_url",
"https://www.credly.com/badges/9f7a9b0a-d94a-494c-a4b6-581cc3411f14/public_url",
"https://www.credly.com/badges/485f9368-c565-4d7c-b779-04f66c2c2fd9/public_url",
"https://www.credly.com/badges/4c82909b-444a-486b-8b9d-a5664aee75ac/public_url",
"https://www.credly.com/badges/f23a378d-bf7c-4279-be78-3a2bfcc2962e/public_url"
]

headers = {
    "User-Agent": "Mozilla/5.0"
}

output = []

for url in BADGES:
    print("Reading:", url)

    r = requests.get(url, headers=headers)

    soup = BeautifulSoup(r.text, "html.parser")

    title = ""
    issuer = ""
    image = ""

    og_title = soup.find("meta", property="og:title")
    if og_title:
        title = og_title.get("content","")

    og_image = soup.find("meta", property="og:image")
    if og_image:
        image = og_image.get("content","")

    description = soup.find("meta", attrs={"name":"description"})
    if description:
        issuer = description.get("content","")

    output.append({
        "title": title,
        "issuer": issuer,
        "image": image,
        "url": url
    })

with open("badges.json","w",encoding="utf-8") as f:
    json.dump(output,f,indent=4,ensure_ascii=False)

print("\nDone.")
print("badges.json created.")
