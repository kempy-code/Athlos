// =====================================
// ATHLOS SELECT RENDERER
// public/js/renders/select.js
// =====================================


export function renderSelect(

    container,

    question,

    selectAnswer

){


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "select-container";



    question.options.forEach(option=>{


        const item =
            document.createElement("button");



        item.type =
            "button";



        item.className =
            "select-option";



        item.innerHTML = `

            <span>
                ${option}
            </span>

        `;




        item.addEventListener(

            "click",

            ()=>{


                document
                .querySelectorAll(
                    ".select-option"
                )
                .forEach(button=>{

                    button.classList.remove(
                        "selected"
                    );

                });



                item.classList.add(
                    "selected"
                );



                selectAnswer(
                    option
                );


            }

        );



        wrapper.appendChild(
            item
        );


    });



    container.appendChild(
        wrapper
    );


}