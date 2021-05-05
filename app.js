const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const copyHexCode = document.querySelectorAll('.copy-to-clipboard');
const heading = document.querySelectorAll('.heading');
const adjustBtn = document.querySelectorAll('.adjust');
const closeHsl = document.querySelectorAll('.close-adjustment');
const sliderContainer = document.querySelectorAll('.sliders');
const lockBtn = document.querySelectorAll('.lock');
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.save-submit');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-name');
let initialColors;
let savedPalettes = [];
generateBtn.addEventListener('click',randomColors);
heading.forEach((hex,index) =>{
    hex.addEventListener('click', () => {
        copyHex(index);
    });
});
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateText(index);
    });
});
adjustBtn.forEach((button, index) => {
    button.addEventListener('click', () => showControls(index));
});
closeHsl.forEach((closeBtn, index) => {
    closeBtn.addEventListener('click', () => hideHsl(index));
});
lockBtn.forEach((lock, index) => {
    lock.addEventListener('click', () => lockDiv(index));
});
function generateHex(){
    let hexColor = chroma.random();
    return hexColor;
}
function randomColors(){
    initialColors = [];
    colorDivs.forEach((div, index) => {
        let hexText  = currentHexes[index];
        let randomHex = generateHex();
        if(div.classList.contains('locked')){
            initialColors.push(hexText.textContent);
            return;
        } else {
        initialColors.push(chroma(randomHex).hex());
    }
        div.style.background = randomHex;
        hexText.innerHTML = randomHex;
        checkContrast(randomHex, hexText);
        const color = chroma(randomHex);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    resetSliders();
    adjustBtn.forEach((button, index) => {
        checkContrast(initialColors[index], button);
        checkContrast(initialColors[index], lockBtn[index]);
    });
}
function checkContrast(color, text){
    let luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = 'black';
    } else {
        text.style.color = 'white';
    }
}
function colorizeSliders(color, hue, brightness, saturation){
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scale = chroma.scale([noSat, color, fullSat]);
    saturation.style.background = `linear-gradient(to right, ${scale(0)}, ${scale(1)})`;
    const scaleBright = chroma.scale(['black', color, 'white']);
    brightness.style.background = `linear-gradient(to right, ${scaleBright(0)},${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.background = `linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`;
}
function hslControls(e){
    const index = e.target.getAttribute('data-bright') || 
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const saturation = sliders[2];
    const brightness = sliders[1];
    const bgColor = initialColors[index];
    let color = chroma(bgColor)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .set('hsl.s', saturation.value);
    colorDivs[index].style.background = color;
    colorizeSliders(color, hue, brightness, saturation);
}
function updateText(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.background);
    const hexText = activeDiv.querySelector('h2');
    hexText.textContent = color;
    checkContrast(color, hexText);
    const icons = activeDiv.querySelectorAll('.controls button');
    icons.forEach(icon => {
        checkContrast(color, icon);
    });
}
function copyHex(index){
    copyHexCode[index].style.opacity = '1';
    copyHexCode[index].innerHTML = 'Copied! <span class="arrow-down"></span>';
    currentHexes[index].style.animation = 'bounceIn 0.5s ease-in-out';
    const textArea = document.createElement('textarea');
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.value = currentHexes[index].textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    clearCopy(index);
}
function clearCopy(index){
        setTimeout(function () {
            copyHexCode[index].style.opacity = '1';
            copyHexCode[index].innerHTML = 'Copy Hex <span class="arrow-down"></span>';  
            currentHexes[index].style.animation = '';
        }, 2000);
        
    }

function resetSliders(){
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name === 'hue'){
            const initialHue = initialColors[slider.getAttribute('data-hue')];
            const hueColor = chroma(initialHue).hsl()[0];
            slider.value = Math.floor(hueColor);
        }
        if(slider.name === 'brightness'){
            const initialBright = initialColors[slider.getAttribute('data-bright')];
            const brightColor = chroma(initialBright).hsl()[2];
            slider.value = Math.floor(brightColor * 100) / 100;
        }
        if(slider.name === 'saturation'){
            const initialSat = initialColors[slider.getAttribute('data-sat')];
            const satColor = chroma(initialSat).hsl()[1];
            slider.value = Math.floor(satColor * 100) / 100;
        }
    });
}
function showControls(index){
    sliderContainer[index].classList.toggle('active');
}
function hideHsl(index){
    sliderContainer[index].classList.remove('active');

}
function lockDiv(index){
    lockBtn[index].classList.toggle('locked');
    const activeBg = colorDivs[index];
    activeBg.classList.toggle('locked')
    if(lockBtn[index].classList.contains('locked')){
        lockBtn[index].innerHTML = '<i class="material-icons">lock</i>';

    } else {
        lockBtn[index].innerHTML = '<i class="material-icons">lock_open</i>';
    }
}
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);
function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}
function closePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.add('remove');
}
function savePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const paletteName = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.textContent);
    });
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;

    }
    const paletteObj = {paletteName, colors, nr: paletteNr};
    savedPalettes.push(paletteObj); 
    saveInput.value = '';
    saveToLocal(paletteObj);
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.paletteName;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
    });
    const previewBtn = document.createElement('button');
    previewBtn.classList.add('pick-palette-btn');
    previewBtn.classList.add(paletteObj.nr);
    previewBtn.innerText = 'Select';
    previewBtn.addEventListener('click', e => {
        closeLibrary();
        btnIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[btnIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.background = color;
            const text = colorDivs[index].children[0].children[0];
            text.innerText = color;
            checkContrast(color, text);
            updateText(index);
        });
        resetSliders();
    });
    
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(previewBtn);
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}
function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}
function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.add('remove');
}

function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes =[];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        const savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.paletteName;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
    });
    const previewBtn = document.createElement('button');
    previewBtn.classList.add('pick-palette-btn');
    previewBtn.classList.add(paletteObj.nr);
    previewBtn.innerText = 'Select';
    previewBtn.addEventListener('click', e => {
        closeLibrary();
        btnIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[btnIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.background = color;
            const text = colorDivs[index].children[0].children[0];
            text.innerText = color;
            checkContrast(color, text);
            updateText(index);
        });
        resetSliders();
    });
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(previewBtn);
    libraryContainer.children[0].appendChild(palette);
  });
 }
}
getLocal();
