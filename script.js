
document.addEventListener("DOMContentLoaded", () => {
    const archivoContextual1 = "./food/People_Diagram.pdf";
    const archivoContextual2 = "./food/People_Data_Model.pdf";
    let jsonData;

    fetch(`http://localhost:${8888}/excel-data`) // Use the same port as the server
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            console.log("JSON data from server:", jsonData);

            const promptButton = document.getElementById("promptButton");

            promptButton.addEventListener("click", async () => {
                const inputUsuario = document.getElementById("inputUsuario").value;

                const prompt = `Busca la frase '${inputUsuario}' en el listado ${JSON.stringify(jsonData)} y decime de que tabla viene y que datos tiene, basandote en este archivo ${archivoContextual1} y este otro ${archivoContextual2}. ignora las tablas que empiecen con 'HT_' ya que esas se refieren a catalogos`;

                fetch('/ask-openai', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: prompt }) // Send prompt in the body
                })
                .then(response => response.json())
                .then(data => {
                    if(data.error){
                        console.error("OpenAI Error",data.error)
                        return;
                    }
                    const liAnswer = construirElemento('li', {}, data.answer); // Use data.answer
                    document.getElementById("answerList").appendChild(liAnswer);
                    console.log(data.answer);
                })
                .catch(error => {
                    console.error("Error calling OpenAI API:", error.toString());
                });

            });
        })
        .catch(error => {
            console.error("Error fetching Excel data:", error.toString());
        });
        
        fetch(`http://localhost:${8888}/ask-openai`, { // POST request to OpenAI route
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt }) // Send prompt in the body
        })
        .then(response => response.json())
        .then(data => {
            if(data.error){
                console.error("OpenAI Error",data.error)
                return;
            }
            const liAnswer = construirElemento('li', {}, data.answer); // Use data.answer
            document.getElementById("answerList").appendChild(liAnswer);
            console.log(data.answer);
        })
        .catch(error => {
            console.error("Error calling OpenAI API:", error);
        });
    function construirElemento(tipoDeElemento = '', atributo = {}, texto = '') {
        let elemento = document.createElement(tipoDeElemento);
        setearAttributos(elemento, atributo);
        elemento.innerText = texto;
        return elemento;
    }

    function setearAttributos(el, attrs) {
        for (const key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }
});
