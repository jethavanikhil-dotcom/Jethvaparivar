# Jethva Parivar Website

A family archive for the descendants of Dewji Bapa, built from the *Jethwa Vanshavali*, second edition (October 2026), compiled by Manoj Ramniklal Jethwa.

## Pages

| Page | Content |
|---|---|
| `index.html` | Welcome, the compiler's note, and the seven sections of the archive |
| `lineage.html` | Searchable family tree of 262 people over 12 generations. `lineage.html#73` opens person #73 |
| `people.html` | Faces of our family (photographs still to be added) |
| `time.html` | History of the Jethwas of Saurashtra: legends, timeline, Ranas of Porbandar |
| `land.html` | Map of the places in the story |
| `memory.html` | Gotra, Kuldev and the nivad list, Sikotra Mata, Sura Pura Bapa, Barot |
| `archive.html` | Documents, glossary, names to confirm, how to contribute, sources |

## Family tree data

`data/people.js` holds everyone in the tree. Each person keeps the permanent `#` number from the book (`id`), with `gen` (pedhi), `parent`, `sex`, and optional `alt` (other spellings), `aka`, `spouse`, `born`, `died`, `late`, `unsure` (may be the same person as another entry) and `photo`.

Birth years of living people (no death year recorded) are deliberately left out.

To add someone, add a line with a new `id` and their `parent`'s id.

## Branches

- `main`: stable, published version of the site
- `dev`: ongoing work; changes are merged into `main` when ready

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```
