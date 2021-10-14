console.log("Let's get this party started!");

//Add all page elements with ids that are needed to collect and submit values
const searchInput = document.getElementById('#search');
const submitBtn  = document.getElementById('#submit');
const removeBtn = document.getElementById('#delete');
const gifContainer = document.getElementById('#gif-container')

/*
searchInput.addEventListener(function(e){
    e.preventDefault();
    fetchGif();
    searchInput.value = " ";
});

removeBtn.addEventListener(function(e){
    img.remove();
});
*/
async function fetchGif(){
    const res = await axios.get('api.giphy.com/v1/gifs/search?q=`${searchInput}`&api_key=I9k7dN8ybyxlyER5yc30YYTvNskJ2HAm&limit=25');
        console.log(res)
}

