# Dessine l'icône du Harnais : une sangle aux six couleurs des chapitres, tenue par une boucle.
# Produit marque/icones/ (icon.png 1024 px, icon.ico multi-tailles, et les PNG attendus par OpenCode).
# Usage : python marque/dessiner-icone.py   (Pillow requis : pip install pillow)

from pathlib import Path
from PIL import Image, ImageDraw

ICI = Path(__file__).parent
SORTIE = ICI / "icones"
COULEURS = ["#6E4A8E", "#A63F17", "#24609A", "#7A6514", "#2F7356", "#A3304F"]  # les chapitres (panneau, .lh-bande)
FOND = "#1C1E2B"
BOUCLE = "#F2F0EA"


def dessiner(taille: int) -> Image.Image:
    f = 4  # suréchantillonnage, pour des bords lisses
    t = taille * f
    image = Image.new("RGBA", (t, t), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    marge = round(t * 0.06)
    d.rounded_rectangle([marge, marge, t - marge, t - marge], radius=round(t * 0.2), fill=FOND)

    # La sangle : six bandes horizontales, d'un bord à l'autre du carré.
    haut, bas = round(t * 0.32), round(t * 0.68)
    pas = (bas - haut) / len(COULEURS)
    for i, couleur in enumerate(COULEURS):
        d.rectangle([marge, round(haut + i * pas), t - marge, round(haut + (i + 1) * pas)], fill=couleur)

    # La boucle : un cadre clair autour de la sangle, au centre.
    e = round(t * 0.065)
    x0, x1 = round(t * 0.36), round(t * 0.64)
    y0, y1 = haut - round(t * 0.09), bas + round(t * 0.09)
    d.rounded_rectangle([x0, y0, x1, y1], radius=round(t * 0.06), outline=BOUCLE, width=e)
    # L'ardillon : la tige qui traverse la boucle.
    d.rounded_rectangle([round(t * 0.485), y0 + e // 2, round(t * 0.515), y1 - e // 2], radius=round(t * 0.015), fill=BOUCLE)

    # Le bord du carré recoupe la sangle : on repasse le masque arrondi.
    masque = Image.new("L", (t, t), 0)
    ImageDraw.Draw(masque).rounded_rectangle([marge, marge, t - marge, t - marge], radius=round(t * 0.2), fill=255)
    image.putalpha(Image.composite(image.getchannel("A"), masque, masque))
    return image.resize((taille, taille), Image.LANCZOS)


SORTIE.mkdir(exist_ok=True)
grande = dessiner(1024)
grande.save(SORTIE / "icon.png")
grande.save(SORTIE / "dock.png")
grande.save(SORTIE / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
for nom, taille in {
    "32x32.png": 32,
    "64x64.png": 64,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
    "StoreLogo.png": 50,
}.items():
    dessiner(taille).save(SORTIE / nom)
print(f"Icônes écrites dans {SORTIE}")
