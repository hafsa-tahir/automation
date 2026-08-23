# PDF Export Inspection Notes

Inspected `/home/ubuntu/upload/tavi-and-the-silent-song_e6c658e8.pdf`, pages 1–4.

- Page 1 is a cover image page.
- Page 2 is a separate title page.
- Page 3 matches the desired scene-spread model: illustration on the left and text on the right.
- Page 4 is incorrect relative to the requested format: the text appears on the left and the illustration appears on the right, which means the export is alternating or reordering scene layout instead of keeping illustration-left and text-right consistently for every scene.

Primary defect identified so far: the PDF export pagination/layout logic does not consistently preserve the corrected reader model for every scene spread.
