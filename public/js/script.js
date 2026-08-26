// =====================================
// ATHLOS MAIN SCRIPT
// public/js/script.js
// =====================================


// =====================================
// QUESTION ENGINE
// =====================================

import {

    initQuestionEngine,
    getCurrentQuestion,
    getNextVisibleQuestion,
    nextQuestion,
    answerQuestion,
    validateAnswer,
    isComplete

} from "./questionEngine.js";




// =====================================
// STATE
// =====================================

import {

    getState,
    loadState,
    finishQuiz as markQuizFinished

} from "./state.js";

import { hydrateAppData, loadPlan, savePlan } from "./appStore.js";
import { getCurrentUser, renderAuth } from "./authClient.js";
import { isStaticHosting } from "./api.js";
import { demoPlan } from "./demoPlan.js";
import { seedDemoData } from "./appStore.js";




// =====================================
// QUESTION RENDERERS
// =====================================

import {

    renderSelect

} from "./renders/select.js";


import {

    renderCard

} from "./renders/card.js";


import {

    renderSlider

} from "./renders/slider.js";


import {

    renderNumber

} from "./renders/number.js";


import {

    renderText

} from "./renders/text.js";


import {

    renderChips

} from "./renders/chips.js";


import {

    renderToggle

} from "./renders/toggle.js";



import {

    renderLoading

} from "./renders/loading.js";




// =====================================
// RESULTS DASHBOARD
// =====================================

import {

    loadDashboard

} from "./results/results.js";








// =====================================
// DOM
// =====================================


const title =
document.getElementById(
    "question-title"
);



const description =
document.getElementById(
    "question-description"
);



const options =
document.getElementById(
    "options"
);



const nextButton =
document.getElementById(
    "next-btn"
);



const progress =
document.getElementById(
    "progress-bar"
);






// =====================================
// CURRENT ANSWER
// =====================================


let currentAnswer = null;








// =====================================
// START APPLICATION
// =====================================


async function start(){

    loadState();
    if (isStaticHosting()) {
        renderAuth(document.querySelector(".container"), { staticMode: true });
        return;
    }
    const user=await getCurrentUser();
    if(!user){renderAuth(document.querySelector(".container"));return;}
    document.body.classList.remove("public-site");
    await hydrateAppData();
    const savedPlan = loadPlan();
    if (savedPlan) {
        loadDashboard(savedPlan);
        return;
    }
    initQuestionEngine();


    renderCurrentQuestion();


}








// =====================================
// RENDER QUESTION
// =====================================


function renderCurrentQuestion(){



    const question =
        getNextVisibleQuestion();





    if(!question){


        finishQuiz();


        return;


    }





    currentAnswer = null;





    title.textContent =
        question.title;





    if(description){


        description.textContent =
            question.description || "";


    }





    options.innerHTML = "";







    switch(question.type){



        case "select":


            renderSelect(

                options,

                question,

                selectAnswer

            );


            break;






        case "card":


            renderCard(

                options,

                question,

                selectAnswer

            );


            break;






        case "chips":


            renderChips(

                options,

                question,

                selectAnswer

            );


            break;






        case "toggle":


            renderToggle(

                options,

                question,

                selectAnswer

            );


            break;






        case "slider":


            renderSlider(

                options,

                question,

                selectAnswer

            );


            break;






        case "number":


            renderNumber(

                options,

                question,

                selectAnswer

            );


            break;






        case "text":


            renderText(

                options,

                question,

                selectAnswer

            );


            break;






        default:


            console.error(

                "Unknown question type:",
                question.type

            );


    }





    updateProgress();


}








// =====================================
// ANSWER SELECTION
// =====================================


function selectAnswer(value){


    currentAnswer = value;


}








// =====================================
// NEXT BUTTON
// =====================================


nextButton.addEventListener(

    "click",

    ()=>{



        const question =
            getCurrentQuestion();





        if(

            !validateAnswer(

                question,

                currentAnswer

            )

        ){



            alert(
                "Please answer this question"
            );


            return;


        }







        answerQuestion(

            question.id,

            currentAnswer

        );







        if(isComplete()){


            finishQuiz();


            return;


        }






        nextQuestion();





        renderCurrentQuestion();



    }

);








// =====================================
// PROGRESS BAR
// =====================================


function updateProgress(){



    const state =
        getState();





    const total =
        state.totalQuestions || 1;





    const current =
        state.currentQuestionIndex + 1;





    const percent =
        (
            current /
            total

        ) * 100;







    if(progress){


        progress.style.width =
            `${percent}%`;


    }



}








// =====================================
// FINISH ONBOARDING
// =====================================


async function finishQuiz(){

    const container =
        document.querySelector(".container");

    if(!container){

        console.error(
            "Athlos: Main container '.container' was not found"
        );

        return;

    }

    container.innerHTML = `

        <div class="results">

            <h1>
                Building your Athlos plan...
            </h1>

            <div id="loading"></div>

        </div>

    `;

    renderLoading(
        document.getElementById(
            "loading"
        )
    );

    await generatePlan();

}




// =====================================
// SEND PROFILE TO AI
// =====================================


async function generatePlan(){



    const state =
        getState();





    try{



        const response =
        await fetch(

            "/api/chat",

            {


                method:"POST",



                headers:{


                    "Content-Type":
                    "application/json"


                },



                body:JSON.stringify({


                    profile:
                    state.profile



                })



            }


        );








        const data = await response.json().catch(() => ({}));







        if(!response.ok || data.error){


            throw new Error(
                data.details || data.error || `Request failed (${response.status})`
            );


        }

        console.log(
            "AI PLAN:",
            data.plan
        );

        savePlan(data.plan);
        markQuizFinished();

        showProgram(

            data.plan

        );





    }

    catch(error){



        console.error(
            error
        );




        const results =
            document.querySelector(".results");

        if(results){

            results.innerHTML = `
                <div class="generation-error">
                    <span aria-hidden="true">!</span>
                    <h1>We couldn’t build your plan</h1>
                    <p id="generation-error-message"></p>
                    <div class="generation-actions">
                        <button id="retry-generation" class="next-button" type="button">Try again</button>
                        <button id="restart-onboarding" class="secondary-button" type="button">Start over</button>
                    </div>
                </div>
            `;
            results.querySelector("#generation-error-message").textContent = error.message || "Please check that the Athlos server is running, then try again.";
            results.querySelector("#retry-generation").addEventListener("click", finishQuiz);
            results.querySelector("#restart-onboarding").addEventListener("click", () => {
                localStorage.removeItem("athlos_state");
                window.location.reload();
            });

        }



    }


}








// =====================================
// LOAD RESULTS DASHBOARD
// =====================================


function showProgram(plan){

    const container =
        document.querySelector(".container");

    if(!container){

        console.error(
            "Athlos: Main container '.container' was not found"
        );

        return;

    }

    document.getElementById("onboarding-progress")?.setAttribute("hidden", "");
    loadDashboard(plan);

}




// =====================================
// RUN
// =====================================

window.addEventListener("athlos:open-demo", () => {
    seedDemoData(demoPlan);
    document.body.classList.remove("public-site");
    showProgram(demoPlan);
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(new URL("../service-worker.js", import.meta.url)).catch(() => {}));
}


start();
