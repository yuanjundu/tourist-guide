
let morning1 = ["Start your morning with gratitude and appreciation for the new day ahead at ",
"Start your morning to fuel your body and mind at ",
"Start your morning with a moment of mindfulness or meditation to set a peaceful tone for the day at ",
"Start your morning with some light stroll to get your body moving at ", 
"Start your morning to kickstart your day with a dose of comfort at ",
"Start your morning with a clear plan and priorities to stay focused and productive at ",
"Start your morning with a positive affirmation to boost your confidence and motivation at ",
"Start your morning with a quick review of your goals and intentions for the day at ",
"Start your morning with a hug or a kind gesture to a loved one to spread some love and positivity at "];
    

let prefix=["Subsequently, you'll have the chance ",
"Following that, you'll be able ",
"Consequently, you'll be in a position ",
"Later on, consider to ",
"Next, you have the chance ",
"Next up, take the opportunity ",
"Once that's done, you can  ",
"Following that, you can ",
"Afterward, feel free to ",
"Once that's done, you can ",
"Afterward, feel free to ",
"In the meantime, you may "]

let morning2=["to take a moment to appreciate the beauty of the ",
"embrace the possibilities that lie ahead with ",
"seize the day with enthusiasm and purpose at ",
"embark on new adventures and discoveries at ",
"let go of yesterday's worries and start afresh by visiting ",
"express gratitude for the simple joys in life at "]

export function firstpara() {
    let para = (morning1[(Math.floor(Math.random() * morning1.length))]);
    return para;
}

export function restpara() {
    let para1 = (prefix[(Math.floor(Math.random() * prefix.length))]);
    let para2 = (morning2[(Math.floor(Math.random() * morning2.length))]);
    const para = para1 + para2
    return para;
}

// const morningenhance1 = (morning1[(Math.floor(Math.random() * morning1.length))]);
// const morningenhance2 = (morning2[(Math.floor(Math.random() * morning2.length))]);
// const morningenhance3 = (morning2[(Math.floor(Math.random() * morning2.length))]);
// const morningenhance4 = (morning2[(Math.floor(Math.random() * morning2.length))]);
// const morningenhance5 = (morning2[(Math.floor(Math.random() * morning2.length))]);