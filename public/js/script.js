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

    getState

} from "./state.js";




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


function start(){


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



    document
    .querySelector(".container")
    .innerHTML = `


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








        const data =
            await response.json();







        if(data.error){


            throw new Error(
                data.error
            );


        }

        console.log(
            "AI PLAN:",
            data.plan
        );

        showProgram(

            data.plan

        );





    }

    catch(error){



        console.error(
            error
        );




        document
        .querySelector(".results")
        .innerHTML = `


            <h1>
                Error generating program
            </h1>


            <p>
                ${error.message}
            </p>


        `;



    }


}








// =====================================
// LOAD RESULTS DASHBOARD
// =====================================


function showProgram(plan){



    document
    .querySelector(".container")
    .innerHTML = "";





    const dashboard =
        document.createElement(
            "div"
        );





    dashboard.className =
        "athlos-dashboard";






    dashboard.innerHTML = `



        <section class="dashboard-header">


            <h1>
                Your Athlos Program
            </h1>



            <p>
                Personalised AI training plan
            </p>



        </section>





        <section id="summary"></section>


        <section id="calendar"></section>


        <section id="workouts"></section>


        <section id="analytics"></section>


        <section id="nutrition"></section>


        <section id="recovery"></section>


        <section id="exercises"></section>


        <section id="achievements"></section>



    `;







    document
    .querySelector(".container")
    .appendChild(
        dashboard
    );






    loadDashboard(plan);



}








// =====================================
// RUN
// =====================================


start();