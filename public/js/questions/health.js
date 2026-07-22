// =====================================
// ATHLOS HEALTH & LIMITATIONS QUESTIONS
// public/js/questions/health.js
// =====================================


export default [

    {
        id:"has_injury",

        title:"Do you currently have any injuries or limitations?",

        description:
        "This helps Athlos keep your training safe and effective.",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ]

    },





    {
        id:"injury_location",

        title:"Where is your injury?",

        type:"chips",

        options:[

            "Foot",

            "Ankle",

            "Knee",

            "Hip",

            "Back",

            "Shoulder",

            "Elbow",

            "Wrist",

            "Other"

        ],

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"injury_description",

        title:"Describe your injury.",

        description:
        "Include what happened and when it started.",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Knee pain after running for 3 weeks",

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"injury_duration",

        title:"How long have you had this injury?",

        type:"chips",

        options:[

            "Less than 1 week",

            "1-4 weeks",

            "1-3 months",

            "3+ months"

        ],

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"pain_level",

        title:"How much discomfort does it cause?",

        type:"slider",

        min:0,

        max:10,

        default:0,

        unit:"/10",

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"restricted_movements",

        title:"Are there movements you cannot do?",

        type:"chips",

        multiple:true,

        options:[

            "Running",

            "Jumping",

            "Squatting",

            "Lifting",

            "Throwing",

            "None"

        ],

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"medical_guidance",

        title:"Have you received medical or physio advice?",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ],

        condition:{

            question:"has_injury",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"medical_restrictions",

        title:"What restrictions were recommended?",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Avoid sprinting for 4 weeks",

        condition:{

            question:"medical_guidance",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"health_notes",

        title:"Anything else Athlos should know?",

        type:"text",

        multiline:true,

        placeholder:
        "Previous injuries, concerns, preferences..."

    }

];