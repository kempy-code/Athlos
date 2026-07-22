// =====================================
// ATHLOS TOGGLE RENDERER
// public/js/renders/toggle.js
// =====================================



export function renderToggle(

    container,

    question,

    selectAnswer

){



    const wrapper =
        document.createElement("div");



    wrapper.className =
        "toggle-container";






    const options =
        question.options || [

            "Yes",

            "No"

        ];






    options.forEach(option=>{



        const button =
            document.createElement("button");



        button.className =
            "toggle-option";



        button.textContent =
            option;







        button.addEventListener(

            "click",

            ()=>{





                document

                .querySelectorAll(
                    ".toggle-option"
                )

                .forEach(item=>{


                    item.classList.remove(
                        "selected"
                    );


                });







                button.classList.add(
                    "selected"
                );






                selectAnswer(
                    option
                );





            }

        );





        wrapper.appendChild(
            button
        );



    });







    container.appendChild(
        wrapper
    );



}