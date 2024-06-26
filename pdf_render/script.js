document.addEventListener('DOMContentLoaded', () => {
    setupTopBar();
    // Fetch JSON data from the server and generate kasser
    fetch('http://localhost:3000/data')
        .then(response => response.json())
        .then(data => {
            renderPDF('http://localhost:3000/pdf', data);
        });
});

const offset =1



/**
 * Set up the top bar layout and styles.
 */
function setupTopBar() {
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';
    styleTopBar(topBar);

    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.textContent = 'Toggle Empty Pages';
    styleButton(toggleButton);
    toggleButton.addEventListener('click', toggleEmptyPages);

    topBar.appendChild(toggleButton);
    document.body.appendChild(topBar);
}

/**
 * Style the top bar element.
 * @param {HTMLElement} topBar 
 */
function styleTopBar(topBar) {
    topBar.style.cssText = `
        position: fixed;
        top: 0;
        width: 100%;
        background-color: #333;
        color: white;
        text-align: center;
        padding: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
}

/**
 * Style the button element.
 * @param {HTMLElement} button 
 */
function styleButton(button) {
    button.style.cssText = `
        padding: 10px 20px;
        background-color: green;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
    `;
}

/**
 * Toggle the visibility of pages without claims.
 */
function toggleEmptyPages() {
    const kasser = document.querySelectorAll('.kasse');
    kasser.forEach(kasse => {
        const claims = kasse.querySelectorAll('.claim');
        if (claims.length === 0) {
            kasse.style.display = kasse.style.display === 'none' ? 'flex' : 'none';
        }
    });
}

/**
 * Set up the initial page layout and styles, and create the container.
 * @returns {HTMLElement} The container element.
 */
function setupPage() {
    document.body.style.cssText = `
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 70px 20px 20px; /* Adjust padding to account for the top bar */
        box-sizing: border-box;
        height: 100vh;
        overflow: hidden;
    `;

    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        height: calc(100vh - 70px); /* Adjust height to account for the top bar */
        overflow: auto;
    `;

    document.body.appendChild(mainContainer);

    return mainContainer;
}

/**
 * Style the page container element.
 * @param {HTMLElement} pageContainer 
 */
function stylePageContainer(pageContainer) {
    pageContainer.style.cssText = `
        display: flex;
        width: 100%;
        margin-bottom: 20px;
        align-items: flex-start;
    `;
}

/**
 * Style the kasse element.
 * @param {HTMLElement} kasse 
 */
function styleKasse(kasse) {
    kasse.style.cssText = `
        position: relative;
        width: 50%;
        border: 2px solid black;
        margin: 10px;
        display: flex;
        flex-direction: column;
        background-color: grey;
        padding: 10px;
        box-sizing: border-box;
    `;
}

/**
 * Style the PDF container element.
 * @param {HTMLElement} pdfPage 
 */
function stylePDFPage(pdfPage) {
    pdfPage.style.cssText = `
        width: 50%;
        padding: 10px;
        box-sizing: border-box;
    `;
}

/**
 * Create a new 'kasse' div with a title and claims.
 * @param {HTMLElement} container - The container to append the kasse to.
 * @param {Object} page - The page data from JSON.
 */
function createKasse(page) {
    const kasse = document.createElement('div');
    kasse.className = 'kasse';
    styleKasse(kasse);

    // Create and add the main title (page number)
    const mainTitleDiv = createTitle(`Side ${page.number-offset}`, 'main-title', 24);
    kasse.appendChild(mainTitleDiv);

    // Create claim kassen and add claims to it
    const claimKassen = document.createElement('div');
    claimKassen.className = 'claim-kassen';
    styleClaimKassen(claimKassen);

    const claimTitleDiv = createTitle('Claims', 'claim-title', 18);
    claimKassen.appendChild(claimTitleDiv);

    // Create and add claims
    page.claims.forEach(claim => {
        const claimDiv = createClaim(claim);
        claimKassen.appendChild(claimDiv);
    });

    kasse.appendChild(claimKassen);

    return kasse;
}

/**
 * Style the claim kassen element.
 * @param {HTMLElement} claimKassen 
 */
function styleClaimKassen(claimKassen) {
    claimKassen.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        background-color: white;
        border: 1px solid black;
        box-sizing: border-box;
    `;
}

/**
 * Create a title element.
 * @param {string} text - Initial text content for the title.
 * @param {string} className - Class name for the title element.
 * @param {number} fontSize - Font size for the title text.
 * @returns {HTMLElement} The created title element.
 */
function createTitle(text, className, fontSize) {
    const titleDiv = document.createElement('div');
    titleDiv.className = className;
    titleDiv.textContent = text;
    styleTitle(titleDiv, fontSize);

    return titleDiv;
}

/**
 * Style the title element.
 * @param {HTMLElement} titleDiv 
 * @param {number} fontSize 
 */
function styleTitle(titleDiv, fontSize) {
    titleDiv.style.cssText = `
        font-size: ${fontSize}px;
        font-weight: bold;
        background-color: white;
        padding: 5px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin-bottom: 10px;
    `;
}

/**
 * Create a claim element with text and a checkbox.
 * @param {Object} claim - Claim data from JSON.
 * @returns {HTMLElement} The created claim element.
 */
function createClaim(claim) {
    const claimDiv = document.createElement('div');
    claimDiv.className = 'claim';
    styleClaim(claimDiv);

    const claimTextDiv = document.createElement('div');
    claimTextDiv.className = 'claim-text';
    claimTextDiv.textContent = claim.text;
    styleClaimText(claimTextDiv);
    claimDiv.appendChild(claimTextDiv);

    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'claim-checkbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = claim.flag;
    checkboxDiv.appendChild(checkbox);
    styleCheckboxDiv(checkboxDiv);
    claimDiv.appendChild(checkboxDiv);

    return claimDiv;
}

/**
 * Style the claim element.
 * @param {HTMLElement} claimDiv 
 */
function styleClaim(claimDiv) {
    claimDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: lightgrey;
        padding: 5px;
        margin-bottom: 5px;
        box-sizing: border-box;
    `;
}

/**
 * Style the claim text element.
 * @param {HTMLElement} claimTextDiv 
 */
function styleClaimText(claimTextDiv) {
    claimTextDiv.style.cssText = `
        font-size: 16px;
        flex-grow: 1;
    `;
}

/**
 * Style the checkbox div element.
 * @param {HTMLElement} checkboxDiv 
 */
function styleCheckboxDiv(checkboxDiv) {
    checkboxDiv.style.cssText = `
        margin-left: 10px;
    `;
}

/**
 * Render the PDF in the PDF container.
 * @param {string} url - URL of the PDF file.
 * @param {Object} data - JSON data containing pages and claims.
 */
function renderPDF(url, data) {
    const mainContainer = setupPage();

    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(pdf => {
        console.log('PDF loaded');

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            pdf.getPage(pageNumber).then(page => {
                const pageContainer = document.createElement('div');
                stylePageContainer(pageContainer);

                const scale = 1; // Adjust scale to make the PDF pages smaller
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(() => {
                    console.log('Page rendered');
                });

                const pdfPage = document.createElement('div');
                stylePDFPage(pdfPage);
                pdfPage.appendChild(canvas);
                
                const kasse = createKasse(data.pages.find(p => p.number === pageNumber+offset));

                pageContainer.appendChild(pdfPage);
                pageContainer.appendChild(kasse);
                mainContainer.appendChild(pageContainer);
            });
        }
    }, reason => {
        console.error(reason);
    });
}
