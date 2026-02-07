---
# try also 'default' to start simple
theme: ./slidev-theme-hu
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Template for HU.

  Learn more at [Sli.dev](https://sli.dev)
fonts:
  sans: 'Avenir'
  serif: 'Roboto Slab'
  mono: 'Iosevka'
  weights: 200,400,600
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: fade-out
# use UnoCSS
css: unocss
themeConfig:
  paginationX: r
  paginationY: t
  paginationPagesDisabled: [1]
layout: cover
---

<link rel="stylesheet" type="text/css" href="s4.css" />

# AI-S4 Deep Learning
## Image Processing

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->


---
layout: chaptertitle
---

# [IMG-1] Image Data

---
layout: image-right
image: pixels.svg
---

# (Digitale) images
- Images komen voor in twee vormen:
  - Vector-images
    - "Vector" heeft hier geen relevante directe link met lineaire algebra.
    - Buiten de scope van deze lessen.
  - **Bitmap-images**
    - Stel een plaatje voor als een grid met gekleurde punten (pixels).
    - Elke pixel heeft een of meer bytes aan informatie nodig voor de kleur.
    - Positie wordt bepaald door index in een (2D) array.
    - Image heeft een vaste grootte, bepaald door breedte / hoogte.

---
layout: image-left
image: greyscale.jpg
---

# Greyscale images
- Simpelste vorm: Zwart-wit (greyscale).
- Iedere pixel is aan te duiden met één getal:
  - Zwart (geen licht) is 0.
  - Wit (maximaal licht) is 255 (8 bits integer) of 1.0 (float).

Voor veel problemen is greyscale voldoende.
  - Herkennen van geschreven tekst
  - Resultaat van eerdere image-processing, zoals edge detection

---
layout: image-right
image: channels.svg
---

# Kleuren

- Voor kleuren gebruiken we meer dan één waarde per pixel.
- Meest gebruikelijk is RGB: Red, Green, Blue.
  - Andere formaten vaak eerst geconverteerd naar RGB:
    - HSV (helderheid, saturatie, value)
    - CMYK (cyan, magenta, yellow, black) voor drukwerk
- Elk van deze waardes is als een greyscale pixel, en vormt een kleuren-kanaal binnen het grotere plaatje.



---
layout: image-left
image: pixels2.svg
---

# The 3D tensor

- Om te werken met $x$ en $y$ coordinaat van een pixel, en daarbinnen de juiste channel te indexeren, werken we met 3D tensoren:
  - $x \in [0 \dots \text{width}]$
  - $y \in [0 \dots \text{height}]$
  - $c \in [0, 1, 2]$ voor (Red, Green, Blue)

---
layout: image-right
image: python.jpg
---

# Python

- `PIL` voor afbeeldingen.
- Omzetten naar `numpy` arrays.
- Plot met `matplotlib`.

```python
img_arr = np.asarray("/path/to/image.png")

plt.imshow(img_arr, interpolation="nearest")
plt.show()
```

---

# Sommatie en Einstein Notatie

Als we de getallen in de vector / matrix indexeren, kunnen we het systematisch over individuele getallen hebben.

- $v^3$ staat voor het derde element van $\ket v$ 
$$\ket v = v^1{\color{grey}e^1} + v^2{\color{grey}e^2}$$
- $M^1_2$ staat voor het eerste element van de tweede kolom van $\mathbf M$
$$\mathbf M = M^1_1{\color{grey}e^1\otimes\epsilon_1} + M^1_2{\color{grey}e^1\otimes\epsilon_2} + M^2_1{\color{grey}e^2\otimes\epsilon_1} + M^2_2 {\color{grey}e^2\otimes\epsilon_2}$$

De berekeningen voor de elementen van $\ket w = \mathbf M \ket v$ ziet er nu als volgt uit:
$$w^i = \sum_{j = 1}^n M^i_j v^j = M^i_{\color{#00aaff}j} v^{\color{#00aaff}j}$$

Vaak laten we de $\Sigma$ en sommatie index $j$ weg, omdat die eigenlijk al duidelijk is: het is de enige index die twee keer voor komt, boven en beneden.

---
layout: chaptertitle
---

# [IMG-2] Convoluties

---

# Motivatie

- Bij veel machine-learning probleem zijn verschillende features onafhankelijk van elkaar:
  - Huizenprijs o.b.v. oppervlakte, ligging, faciliteiten.
  - Combinaties van factoren zijn niet per sé significant gekoppeld.

- Bij afbeeldingen hangen pixel die naast / onder elkaar staan met elkaar samen.
  - Vaak correlatie (naast een blauwe pixel staat nog een blauwe pixel)
  - Als dit niet zo is, dan zit hier een edge - in veel gevallen interessanter dan de blauwe pixel zelf

- Operaties op afbeeldingen zijn ook "context-afhankelijk":
  - Blur neemt een gemiddelde met omliggende pixels
  - Sharpen probeert dit omgekeerd te doen
  - Edge detection highlight scherpe overgangen

- In deze les gaan we kijken naar **convoluties**, die een dergelijke operatie in getallen laat vatten.
  - *Maar wat is een convolutie?*

---
layout: image-right
image: boxcars.gif
---

# Operatoren

- Soort van functies
    - (Doorgaans) 2 argumenten
    - Weergegeven met een symbool i.p.v. naam
$$1 + 3,\qquad 4 \times 5,\qquad 3 \times x,\qquad \langle u \mid v \rangle, \qquad \dots$$

- Vanaf de basisschool gewend: combineert twee getallen tot een nieuw getal.
  - Maar inmiddels weten we: kan ook op proposities, vectoren, matrices, ...

- Vanaf vandaag: operator op functies
$$[f * g](x)$$

$[f * g]$ is een functie die is samengesteld met de functies $f$ en $g$.

---

# Lijsten als functies

- Functies zijn continu, dus operatoren erop vereisen continue wiskunde
  - ...die we niet hebben gehad
  - *(voor wie wiskunde B heeft gedaan: het heeft te maken met integralen)*

<hsp />
<hsp />
<hsp />

- Wij gaan kijken naar de discrete variant ervan: lijsten van getallen

<hsp />

- Lijsten kunnen we zien als beperkte functies: de functie heeft een waarde op $x = 0, x = 1, \dots, x = n$
  - Het domein van de meeste functies (e.g. $\sin(x)$ of $e^x$) is oneindig en continu ($\mathbb R \to \mathbb R$)
  - Het domein van een lijst-als-functie is eindig en discreet ($\mathcal I \to \mathbb R$, voor $\mathcal I \subset \mathbb N$)
- Conceptueel doen we met een convolutie dezelfde operatie, maar nu hebben we niet oneindig waardes om te beschouwen.

---

# Convoluties op lijsten

Laten we eerst naar een voorbeeld kijken:

$$a = [{\color{#00aaff}1},{\color{#00aaff}2},{\color{#00aaff}3},{\color{#00aaff}4}],\qquad b = [1, 10, 100]$$
$$
\begin{matrix}a * b = [ \ 
 & {\color{#00aaff}1} \times 1,\\
 & {\color{#00aaff}1} \times 10 &+&{\color{#00aaff}2} \times 1,\\
 & {\color{#00aaff}1} \times 100 &+&{\color{#00aaff}2} \times 10 &+&{\color{#00aaff}3} \times 1,\\
 & & & {\color{#00aaff}2} \times 100 &+&{\color{#00aaff}3} \times 10 &+&{\color{#00aaff}4} \times 1,\\
 & & & & & {\color{#00aaff}3} \times 100 &+&{\color{#00aaff}4} \times 10,\\
 & & & & & & & {\color{#00aaff}4} \times 100
& \ ] \end{matrix} \\
\hspace{-4cm} = [1, 12, 123, 234, 340, 400]$$

<hsp />
<hsp />
<hsp />
<hsp />

- In essentie wordt de ene lijst "langs" de andere lijst geschoven.
  - Ieder item in het resultaat is het totaal van een tijd-frame in het schuiven.
  - Dit totaal komt tot stand door de overlappende waardes te vermenigvuldigen, en de som hiervan te nemen. 
    - *Dit lijkt erg op het inwendig product dat we al kennen (al hebben we hier geen vectoren).*

---
layout: two-cols-header
---

#  Convoluties op Lijsten

$$a = [{\color{#00aaff}1},{\color{#00aaff}2},{\color{#00aaff}3},{\color{#00aaff}4}],\qquad b = [1, 10, 100]$$

::left::

$$\begin{matrix}&&{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
100 &10 &1\end{matrix} \to 1 $$

$$\begin{matrix}&{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
100 &10 &1\end{matrix} \to 12 $$

$$\begin{matrix}{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
100 &10 &1\end{matrix} \to 123 $$

::right::

$$\begin{matrix}{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
&100 &10 &1\end{matrix} \to 234 $$

$$\begin{matrix}{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
&&100 &10 &1\end{matrix} \to 340 $$

$$\begin{matrix}{\color{#00aaff}1}&{\color{#00aaff}2}&{\color{#00aaff}3}&{\color{#00aaff}4}&\\
&&&100 &10 &1\end{matrix} \to 400 $$

::bottom::

$$a * b = [1, 12, 123, 234, 340, 400]$$

- In essentie wordt de ene lijst (omgekeerd) "langs" de andere lijst geschoven.
  - Ieder item in het resultaat is het totaal van een tijd-frame in het schuiven.
  - Dit totaal komt tot stand door de overlappende waardes te vermenigvuldigen, en de som hiervan te nemen. 
    - *Dit lijkt erg op het inwendig product dat we al kennen (al hebben we hier geen vectoren).*

--- 
layout: image-right
image: kernel.gif
---

# Convoluties in 2D

- Net als met lijsten kunnen we ook 2D arrays convolueren; beide argumenten zijn in dit geval als een soort matrices te zien.
  - In dit geval schrijven we $I * K$ voor een image $I$ en kernel $K$.
  - De kernel wordt [linksboven] op de afbeelding gelegd;
  - we nemen de overlap van de grotere matrix als een aparte matrix $O$;
  - we berekenen het Frobenius inwendig product
  $$\langle O, K \rangle_F = \sum_{i,j} O_{ij}K_{ij}$$
  - en slaan deze waarde op in het resultaat op de [linksboven] positie.
  - Dit herhalen we voor elke mogelijke overlap.

<rfootnote>Image: MLNotebook</rfootnote>

---
layout: image-right
image: padding.png
---

# Padding

- Zoals op het plaatje te zien is, is er een buitenste ring pixels die op deze manier niet gedefinieerd is;
  - Dit betekent dat de afbeelding verkleint: met een $3\times 3$ kernel gaan de buitenste pixels verloren, met $5\times 5$ zijn dat de buitenste 2, etc.
  - Eventueel kan de afbeelding eerst uitgebreid worden met extra ringen buitenste pixels; dit noemen we padding.

<footnote>Image: MLNotebook</footnote>

---
layout: chaptertitle
---

# Oefening
## Matrix Convoluties in Python (pt I)

---

# Concreet voorbeeld: Box blur

TODO animatie

---
layout: image-right
image: kernels.svg
---

# Bekende kernels

- Gaussian
$$\frac{1}{16}\begin{bmatrix}1 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 1\end{bmatrix}$$
- Unsharp max
$$\frac{1}{16}\begin{bmatrix}-1 & -2 & -1 \\ -2 & 28 & -2 \\ -1 & -2 & -1\end{bmatrix}$$
- Sobel (horizontaal)
$$\frac{1}{8}\begin{bmatrix}-1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1\end{bmatrix}$$


<footnote>Image: Frida Kahlo</footnote>

---

# Convoluties met meerdere channels

- Tot zover zijn we uitgegaan van afbeeldingen met één channel (greyscale), die we als 2D array / matrix hebben beschouwd.
- Kleuren plaatjes hebben nog een derde dimensie - hebben we nu een 3D kernel nodig?
  - Dit is meestal niet zinvol, omdat we voor elk component hetzelfde willen doen;
  - het is dan eenvoudiger om de afbeelding als drie losse channels te beschouwen, drie aparte convoluties uit te voeren, en het resultaat samen te voegen.

---
layout: chaptertitle
---

# Oefening
## Matrix Convoluties in Python (pt I)

---
layout: chaptertitle
---

# [IMG-3] Seam Carving

---
layout: image-right
image: scale.png
---

# Motivatie

- Resizen van images:
  - Verkleinen: iedere $n^e$ pixel weggooien
    - Alternatief: $n$ pixels links of rechts weggooien (crop)
  - Vergroten: nieuwe pixels toevoegen, waarde is gemiddelde omliggende pixels
  - Maar wat als we de verhouding (hoogte/breedte) veranderen?
    - Resultaat vervormd of afgeknipt

---
layout: image-right
image: seam.png
---

# Seam Carving

- Haal niet een hele rij/kolom pixels weg, maar kies het minst interessante pad
  - Een pad loopt van de bovenste naar de onderste rij (alternatief: links-rechts)
  - Elke pixel grenst aan een pixel in de rij erboven/onder

**Dit pad noemen we een seam.**

- Wat maakt een pad interesssant?
  - Gebieden waar veel kleurwaardes veranderen zijn interessant
  - Waar de kleuren hetzelfde zijn als omgeving is het oninteressant
  - Dit is te bepalen met edge-detection, zoals Sobel

---
layout: image-left
image: energy_map.png
---

# Energy map

- Na edge detect weten we van iedere pixel de "energy":
  - Hoge energie (edge) vs lage energie (effen)
- We zoeken het pad met de laagst-mogelijke energie
  - Computationeel duur: heel veel mogelijke paden
  - Dynamisch programmeren om rekentijd te besparen
    - Bouw een map van beneden naar boven op met het beste (laagste energie) pad vanaf die pixel

---
layout: image-right
image: result.png
---

# Totaaloverzicht

**Doel:** Reduceer de breedte van een plaatje van $n$ naar $n^\prime$ pixels.

- Herhaal tot de $n = n^\prime$:
    - Vindt de lowest-energy seam
    - Verwijder deze pixels en schuif de rest op

<hsp/>
<hsp/>
<hsp/>
<hsp/>
<hsp/>
<hsp/>
<hsp/>
<hsp/>
<hsp/>

### Improvements

- Sla tussentijdse versies op (memoisatie)
- Keuze uit horizontaal / verticaal
- Image expansion

---
layout: chaptertitle
---

# Portfolio-item
## [IMG-I] Convoluties en Seam Carving

---

# Opdracht

  - Download de template van GitHub en implementeer de functionaliteit
  - Evalueer de effectiviteit van het algoritme op verschillende plaatjes
    - Hoe vergelijkt dit zich met crop / normale resize
    - Zijn er plaatjes waarvoor het algoritme minder werkt?
      - Wat zou ervoor nodig zijn om dit soort gevallen te verbeteren?
    - Hoe gaat dit algoritme om met upscalen?
