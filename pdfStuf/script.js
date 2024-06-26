const url = './random.pdf';  // Stien til PDF-filen du vil vise
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
      canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d');

// Render the page
function renderPage(num) {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
    });
}

// Load pdf
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    renderPage(pageNum);
});


function addLink(pageNum, text) {
    const link = document.createElement('a');
    link.href = '#';
    link.innerText = text;
    link.onclick = function() {
        renderPage(pageNum);
    };
    document.getElementById('links').appendChild(link);
}

// Tilføj links dynamisk
addLink(1, 'Gå til side 1');
addLink(2, 'Gå til side 2');
// osv...
