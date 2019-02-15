audios = {};
cap = null;

$(document).ready(()=>{
    playAll();
    pauseAll();
    $("#modal-form").on("submit", (e)=>{
        e.preventDefault();
        e.stopPropagation();
        $("#record-modal").modal("hide");
        document.getElementById("record-button").style.display = "initial";
        document.getElementById("stop-record-button").style.display = "none";
        let title = $("#song-title-input").val();
        $("#song-title-input").val("");
        cap.stop();
        pauseAll();
        cap.exportWAV((e)=> {
            let form = new FormData();
            form.append("audio", e);
            form.append("title", title);
            $.ajax({
                url: "upload_wav",
                type: "POST",
                data: form,
                processData: false,
                contentType: false,
                success: (e)=> {
                    location.reload();
                },
            });
        });
    });
});

function playAll() {
    let songs = $("#song-picker > li");
    $.each(songs, (_, s)=>{
        $(s).find("i.fa-play").click();
    });
}
function pauseAll() {
    let songs = $("#song-picker > li");
    $.each(songs, (_, s)=>{
        $(s).find("i.fa-pause").click();
    });
}



function play(e, filename) {
    e.target.style.display = "none";
    let pause_element = e.target.closest("div").getElementsByClassName("fa-pause")[0];
    pause_element.style.display = "inline";
    let audio = null;
    if(filename in audios) {
        audio = audios[filename][0];
    } else {
        audio = new Audio(filename);
    }
    let li_element = e.target.closest("li");
    let progress_bar = setInterval(()=>{
        let percent = Math.round(100 * audio.currentTime / audio.duration) + "%";
        let property = "linear-gradient(left, rgba(50, 150, 255, .5) "+percent+", white "+percent+")";
        let style_str = "";
        [property, "-webkit-"+property, "-moz-"+property, "-ms-"+property].forEach((elem)=>{
            style_str += "background: "+elem+";";
        });
        let current_style = li_element.getAttribute("style");
        li_element.setAttribute("style", current_style+style_str);
    }, 2);
    audio.onended = ()=>{
        audio.currentTime = 0;
        pause_element.click();
    };
    audio.play();
    audios[filename] = [audio, progress_bar];
}

function pause(e, filename) {
    e.target.style.display = "none";
    let play_element = e.target.closest("div").getElementsByClassName("fa-play")[0];
    let li_element = e.target.closest("li");
    play_element.style.display = "inline";
    audios[filename][0].pause();
    clearInterval(audios[filename][1]);
    if(audios[filename][0].currentTime == 0) {
        setTimeout(()=>li_element.style.background = "", 50);
    }
}

function record() {
    document.getElementById("record-button").style.display = "none";
    document.getElementById("stop-record-button").style.display = "initial";
    let stream = new MediaStream();
    let audio_context = new AudioContext();
    let gain = audio_context.createGain();
    for(let fn in audios) {
        let t = audio_context.createMediaStreamSource(audios[fn][0].captureStream());
        let _gain = audio_context.createGain();
        t.connect(_gain);
        _gain.connect(gain);
    }
    cap = new Recorder(gain);
    console.log(cap);
    cap.record();
}
