// =====================================
// ATHLOS UI CONTROLLER
// public/js/ui.js
// =====================================


import {
    getProgress
} from "./questionEngine.js";





// =====================================
// DOM HELPERS
// =====================================


export function $(selector){

    return document.querySelector(selector);

}



export function $$(selector){

    return document.querySelectorAll(selector);

}








// =====================================
// UPDATE QUESTION TEXT
// =====================================


export function updateQuestionHeader(question){



    const title =
        $("#question-title");



    const description =
        $("#question-description");





    if(title){

        title.textContent =
            question.title || "";

    }





    if(description){

        description.textContent =
            question.description || "";

    }



}








// =====================================
// CLEAR OPTIONS AREA
// =====================================


export function clearOptions(){



    const options =
        $("#options");



    if(options){

        options.innerHTML = "";

    }


}








// =====================================
// UPDATE PROGRESS BAR
// =====================================


export function updateProgress(){



    const bar =
        $("#progress-bar");



    if(!bar){

        return;

    }





    const progress =
        getProgress();





    bar.style.width =
        `${progress}%`;





    bar.setAttribute(

        "aria-valuenow",

        Math.round(progress)

    );


}








// =====================================
// BUTTON STATE
// =====================================


export function enableNext(){



    const button =
        $("#next-btn");



    if(button){

        button.disabled =
            false;


        button.classList.remove(
            "disabled"
        );

    }



}








export function disableNext(){



    const button =
        $("#next-btn");



    if(button){

        button.disabled =
            true;



        button.classList.add(
            "disabled"
        );

    }



}








// =====================================
// LOADING SCREEN
// =====================================


export function showLoading(){



    const container =
        $(".container");



    if(!container){

        return;

    }





    container.innerHTML = `

        <div class="loading-screen">


            <div class="loader">


                <div class="loader-circle"></div>


            </div>


            <h2>
                Creating your Athlos plan
            </h2>


            <p>
                Analysing your athlete profile...
            </p>


        </div>

    `;


}








// =====================================
// RESULT SCREEN
// =====================================


export function showResults(plan){



    const container =
        $(".container");



    if(!container){

        return;

    }





    container.innerHTML = `

        <div class="results">


            <h1>
                Your Athlos Program
            </h1>


            <pre>
${JSON.stringify(

    plan,

    null,

    2

)}
            </pre>


        </div>

    `;



}








// =====================================
// ANIMATION HELPERS
// =====================================


export function animateQuestion(){



    const card =
        $(".question-card");



    if(!card){

        return;

    }





    card.classList.remove(
        "question-enter"
    );





    void card.offsetWidth;





    card.classList.add(
        "question-enter"
    );


}








// =====================================
// SCROLL RESET
// =====================================


export function resetScroll(){


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });


}








// =====================================
// QUESTION TRANSITION
// =====================================


export function transitionQuestion(){


    resetScroll();


    animateQuestion();


    updateProgress();


}