// =====================================
// ATHLOS SLIDER RENDERER
// public/js/renders/slider.js
// =====================================



export function renderSlider(

    container,

    question,

    selectAnswer

){



    const wrapper =
        document.createElement("div");


    wrapper.className =
        "slider-container";





    const valueDisplay =
        document.createElement("div");


    valueDisplay.className =
        "slider-value";






    const slider =
        document.createElement("input");



    slider.type =
        "range";



    slider.className =
        "athlos-slider";



    slider.min =
        question.min ?? 0;



    slider.max =
        question.max ?? 10;



    slider.value =
        question.default ?? question.min ?? 0;





    function updateValue(){


        const value =
            slider.value;



        valueDisplay.textContent =
            `${value} ${question.unit || ""}`;





        selectAnswer(
            Number(value)
        );


    }





    slider.addEventListener(

        "input",

        updateValue

    );





    updateValue();






    const labels =
        document.createElement("div");



    labels.className =
        "slider-labels";





    const minLabel =
        document.createElement("span");


    minLabel.textContent =
        question.min ?? 0;





    const maxLabel =
        document.createElement("span");


    maxLabel.textContent =
        question.max ?? 10;






    labels.appendChild(
        minLabel
    );


    labels.appendChild(
        maxLabel
    );






    wrapper.appendChild(
        valueDisplay
    );


    wrapper.appendChild(
        slider
    );


    wrapper.appendChild(
        labels
    );




    container.appendChild(
        wrapper
    );



}