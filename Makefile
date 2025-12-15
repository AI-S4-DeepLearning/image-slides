SRCS=$(filter-out README.md, $(wildcard *.md))
PDFS=$(subst .md,.pdf,$(SRCS))
TITLE="High Performance Programming"

.PHONY: all clean

all: $(PDFS) make_index.py
	mkdir -p public
	python make_index.py $(TITLE) > public/index.html
	cp $(PDFS) public

%: %.md
	npx slidev "$^"

%.pre.pdf: %.md
	npx slidev export --executable-path `which chromium` "$^" --output "$@"

%.pdf: %.pre.pdf
	gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS="/ebook" -sOutputFile="$@" "$^"

clean:
	rm *.pdf public/*.pdf public/index.html
