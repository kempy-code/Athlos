// =====================================
// ATHLOS PROFILE QUESTIONS
// public/js/questions/profile.js
// =====================================


export default [

    {
        id:"age",

        title:"How old are you?",

        description:
        "This helps Athlos adjust training load and recovery recommendations.",

        type:"slider",

        min:10,

        max:80,

        default:16,

        unit:"years"
    },



    {
        id:"gender",

        title:"What is your gender?",

        type:"chips",

        options:[

            "Male",

            "Female",

            "Prefer not to say"

        ]
    },



    {
        id:"height",

        title:"What is your height?",

        type:"number",

        suffix:"cm",

        placeholder:
        "Example: 175"
    },



    {
        id:"weight",

        title:"What is your weight?",

        type:"number",

        suffix:"kg",

        placeholder:
        "Example: 65"
    },



    {
        id:"weight_change",

        title:"Has your weight changed significantly recently?",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ]
    }

];