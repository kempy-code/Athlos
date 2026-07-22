// =====================================
// ATHLOS TEXT INPUT RENDERER
// public/js/renders/text.js
// =====================================



export function renderText(

    container,

    question,

    selectAnswer

){



    const wrapper =
        document.createElement("div");



    wrapper.className =
        "text-container";






    const input =
        document.createElement(
            question.multiline
            ? "textarea"
            : "input"
        );





    if(
        !question.multiline
    ){

        input.type =
            "text";

    }





    input.className =
        "athlos-text-input";






    input.placeholder =
        question.placeholder ||
        "Enter your answer";





    if(
        question.rows
    ){

        input.rows =
            question.rows;

    }






    input.addEventListener(

        "input",

        ()=>{


            selectAnswer(
                input.value
            );


        }

    );







    wrapper.appendChild(
        input
    );





    container.appendChild(
        wrapper
    );



}