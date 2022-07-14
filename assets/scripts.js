/*
Código Hito 1
Adjunto archivo PDF 02.01.03 Hito 1 - Situación Mundial
*/


const baseUrl = 'http://localhost:3000/api/total'

//Obtener datos de COVID-19 de la API
const getCovidTotal = async (url) => {
    try {
        const response = await fetch(url)
        const  data  = await response.json()
        //Control de registros accesados
        console.log(data)

        // console.log(data[0].location)
        // console.log(data[0].country)

        //        console.log(data[0].confirmed)
        if (data) {
            //Lamada a la función gráfica
            covidGraph(data)
        }
        return data
    }
    catch (error) {
        console.log(`Se ha producido un error en getCovidTotal [catch]: ${error}`)
    }
}

// Obtener datos por pais =  http://localhost:3000/api/countries/${country}
const getApiPais = async (country) => {
    var token = localStorage.getItem('jwt-token');
    try {
        const response = await fetch(`http://localhost:3000/api/countries/${country}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const  data  = await response.json();

        if (data) {
            chartPais(data)
        }
        return data
    }
    catch (err) {
        console.error(`Error datos pais : ${err}`)
    }
}

// Casos - definiendo instancias
// Nivel mundial
let activosCovid = []
let confirmadosCovid = []
let muertesCovid = []
let recuperadosCovid = []
// Nivel pais
let activosPais = []
let confirmadosPais = []
let muertesPais = []
let recuperadosPais = []

const covidGraph = (data) => {
    //Variable
    let dataBackground = data

    //Cálculo de cantidad de sobrevivientes, recuperados (70% de sobrevivientes) y casos activos (30% de sobrevivientes)
    dataBackground.map(tmpRecup => {
        let survivors = tmpRecup.confirmed - tmpRecup.deaths
        tmpRecup.recovered = survivors * 0.70
        tmpRecup.active = survivors * 0.30
        return tmpRecup
    })

    //Confirmación de adquisición de datos OK
    //    console.log(`Location : ${dataBackground[10].location}`)
    //    console.log(`Confirmed: ${dataBackground[10].confirmed}`)
    //    console.log(`Deaths   : ${dataBackground[10].deaths}`)
    //    console.log(`Recovered: ${dataBackground[10].recovered}`)
    //    console.log(`Active   : ${dataBackground[10].active}`)

    //Filtro de activos a graficar (>10.000)
    let dataFilter = dataBackground.filter((searchingData) => {
        return searchingData.active > 2000000   // <------------ Originalmente se esta pidiendo mayores a 10.000.
        //               Este valor se debe DISMINUIR para ampliar el grafico.
        //               Los valores de los CONFIRMADOS son muy elevados,
        //               y si este valor se reduce, las barras de las otras
        //               variables se disminuyes y algunas no se ven.
    })

    //Confirmación de aplicación de filtro OK
    //    console.log(`Location : ${dataFilter[10].location}`)
    //    console.log(`Confirmed: ${dataFilter[10].confirmed}`)
    //    console.log(`Deaths   : ${dataFilter[10].deaths}`)
    //    console.log(`Recovered: ${dataFilter[10].recovered}`)
    //    console.log(`Active   : ${dataFilter[10].active}`)

    dataFilter.forEach((k) => {
        activosCovid.push({
            label: k.country,
            y: k.active,
        });
        confirmadosCovid.push({
            label: k.country,
            y: k.confirmed,
        });
        muertesCovid.push({
            label: k.country,
            y: k.deaths
        })
        recuperadosCovid.push({
            label: k.country,
            y: k.recovered
        })
    });

    //    console.log(confirmadosCovid)
    //    console.log(muertesCovid)

    let config = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "dark1",
        backgroundColor: "#F4F6F7",
        title: {
            text: "Paises con Covid-19",
            fontFamily: 'Open Sans',
            fontWeight: "normal",
            fontColor: "#17202A",
        },
        axisX: {
            title: "",
            labelAngle: -45,
            interval: 1,
            labelFontColor: "#17202A",
        },
        axisY: {
            title: "",
            titleFontColor: "#a3a3a3",
            lineColor: "#a3a3a3",
            labelFontColor: "#17202A",
            tickColor: "#a3a3a3",
            gridThickness: 1
        },

        legend: {
            cursor: "pointer",
            horizontalAlign: "center",
            fontColor: "#17202A",
        },
        dataPointWidth: 15,
        height: 350,

        data: [
            {
                type: "column",
                name: "total activos",
                legendText: "Casos activos",
                showInLegend: true,
                dataPoints: activosCovid
            },
            {
                type: "column",
                name: "total confirmados",
                legendText: "Casos confirmados",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: confirmadosCovid
            },
            {
                type: "column",
                name: "total muertos",
                legendText: "Casos muertos",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: muertesCovid
            },
            {
                type: "column",
                name: "total recuperados",
                legendText: "Casos recuperados",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: recuperadosCovid
            }
        ]
    };
    let chart = new CanvasJS.Chart("covidGraph", config)
    chart.render()

    // grafico pais
    function datoTabla(filtroPais) {
        let texto = "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><tr><th>Paises</th><th>Confirmados</th><th>Muertos</th><th>Gráfico</th></tr>"
        for (let i = 0; i < filtroPais.length; i++) {
            texto += `<tr>
                    <td>${filtroPais[i].country}</td>
                    <td>${filtroPais[i].confirmed}</td>
                    <td>${filtroPais[i].deaths}</td>
                    <td><button type="button" class="btnCountry btn btn-outline-success" data-toggle="modal" data-target="#chartPais" value="${filtroPais[i].country}">ver detalle</button></td>
                    </tr>`
        }
        document.querySelector("#tabla-covid").innerHTML = texto
    }

    datoTabla(dataBackground)
    $(".btnCountry").click(function () {
        activosPais = []
        confirmadosPais = []
        muertosPais = []
        recuperadosPais = []
        const pais = $(this).val()
        var pais2 = pais.split(' ').join('_')
        console.log(pais2)

        // habilitar ventana modal
        window.modal = ($('#chartPais').modal('show'))

        getApiPais(pais2)
    })
}
// grafico pais (Boton HTML)
const chartPais = (data) => {
    let paisData = data

    console.log(`Datos X pais : ${paisData}`)

    console.log(paisData.country)
    console.log(paisData.confirmed)
    console.log(paisData.deaths)
    console.log(paisData.recovered)
    console.log(paisData.active)


    //Cálculo de cantidad de sobrevivientes, recuperados (70% de sobrevivientes) y casos activos (30% de sobrevivientes)
    let survivors2 = paisData.confirmed - paisData.deaths
    paisData.recovered = survivors2 * 0.70
    paisData.active = survivors2 * 0.30

    console.log(paisData.country)
    console.log(paisData.confirmed)
    console.log(paisData.deaths)
    console.log(paisData.recovered)
    console.log(paisData.active)

    activosPais.push({
        label: paisData.country,
        y: paisData.active
    });
    confirmadosPais.push({
        label: paisData.country,
        y: paisData.confirmed
    });
    muertosPais.push({
        label: paisData.country,
        y: paisData.deaths
    });
    recuperadosPais.push({
        label: paisData.country,
        y: paisData.recovered
    })

    console.log(activosPais)
    console.log(confirmadosPais)
    console.log(muertosPais)
    console.log(recuperadosPais)

    let configPais = {
        animationEnabled: true,
        theme: "light1",
        title: {
            text: "Casos : " + paisData.country
        },
        axisX: {
            labelAngle: 0,
            interval: 1
        },
        axisY: {
            title: "Activos",
            titleFontColor: "#000",
            lineColor: "#000",
            labelFontColor: "#000",
            tickColor: "#000"
        },
        axisY2: {
            title: "Confirmados",
            titleFontColor: "#000",
            lineColor: "#000",
            labelFontColor: "#000",
            tickColor: "#000"
        },
        axisY2: {
            title: "Muertes",
            titleFontColor: "#000",
            lineColor: "#000",
            labelFontColor: "#000",
            tickColor: "#000"
        },
        axisY2: {
            title: "Recuperados",
            titleFontColor: "#000",
            lineColor: "#000",
            labelFontColor: "#000",
            tickColor: "#000"
        },

        dataPointWidth: 50,
        height: 200,
        data: [
            {
                type: "column",
                name: "total activos",
                legendText: "Casos activos",
                showInLegend: true,
                dataPoints: activosPais
            },
            {
                type: "column",
                name: "total confirmados",
                legendText: "Casos confirmados",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: confirmadosPais
            },
            {
                type: "column",
                name: "total muertos",
                legendText: "Casos muertos",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: muertosPais
            },
            {
                type: "column",
                name: "total recuperados",
                legendText: "Casos recuperados",
                axisYType: "secondary",
                showInLegend: true,
                dataPoints: recuperadosPais
            }
        ]
    };
    let chart = new CanvasJS.Chart("covidChartPais", configPais)
    chart.render()
}

getCovidTotal(baseUrl)


/*
Código Hito 2
Código Hito 1
Adjunto archivo PDF 03.04.02 Hito 2 - Situación de USA
*/


//Acceso a la API
const consult = async (email, password) => {
    console.log(`${email}; ${password}`)

    let objeto = {
        email: email,
        password: password
    }
    try {
        console.log(`${email}; ${password}; Este es el objeto: ${objeto}`)
        const response = await fetch('http://localhost:3000/api/login', {
            method: "POST",
            body: JSON.stringify(objeto),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        //Almacenamiento local del token
        const { token } = await response.json()
        localStorage.setItem('jwt-token', token)
    return token

    }
    catch (error) {
        console.log(`Usuario y/o password incorrecto(s) [catch]: ${error}`)
        alert(`Usuario y/o password incorrecto(s):\n${error}`)
    }

}

//Obtiene datos de la API

//Casos confirmados (1)
const getDataConfirmed = async (jwt) => {
    try {
        const response = await fetch('http://localhost:3000/api/confirmed', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { dataConfrmed } = await response.json()
        //Control de registros accesados
        console.log(data)

        if (dataConfrmed) {


// ***************** CÓDIGO PARA HACER EL GRÁFICO CON LOS DATOS *****************

        } else {
            //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
            localStorage.clear()
            console.log(`Se ha producido un error: ${error}`)
        }
        return dataConfrmed
    }
    catch (error) {
        //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
        localStorage.clear()
        console.log(`Se ha producido un error en [catch]: ${error}`)
    }
}

//Casos confirmados (2)
const getDataDeaths = async (jwt) => {
    try {
        const response = await fetch('http://localhost:3000/api/deaths', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { dataDeaths } = await response.json()
        //Control de registros accesados
        console.log(dataDeaths)

        if (dataDeaths) {


// ***************** CÓDIGO PARA HACER EL GRÁFICO CON LOS DATOS *****************


        } else {
            //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
            localStorage.clear()
            console.log(`Se ha producido un error: ${error}`)
        }
        return dataDeaths
    }
    catch (error) {
        //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
        localStorage.clear()
        console.log(`Se ha producido un error en [catch]: ${error}`)
    }
}

//Casos confirmados (3)
const getDataRecovered = async (jwt) => {
    try {
        const response = await fetch('http://localhost:3000/api/recovered', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { getDataRecovered } = await response.json()
        //Control de registros accesados
        console.log(getDataRecovered)

        if (getDataRecovered) {


// ***************** CÓDIGO PARA HACER EL GRÁFICO CON LOS DATOS *****************


        } else {
            //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
            localStorage.clear()
            console.log(`Se ha producido un error: ${error}`)
        }
        return getDataRecovered
    }
    catch (error) {
        //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
        localStorage.clear()
        console.log(`Se ha producido un error en [catch]: ${error}`)
    }
}


// Validando que existe JWT
const init = async () => {
    const token = localStorage.getItem('jwt-token')
    if (token) {
        const dataConfirmed = await getDataConfirmed(token)
        const dataDeaths = await getDataDeaths(token)
        const dataRecovered = await getDataRecovered(token)
    }
}
//init()


document.getElementById("login").addEventListener("click", getDatas);

//Cambios a partir del formulario de ingreso
async function getDatas() {
    console.log("En getDatas")
    const email = document.getElementById('exampleInputEmail1').value
    const pass = document.getElementById('exampleInputPassword1').value
    console.log(`${email}; ${pass}`)
    $('#situacionChile').removeClass('d-none').addClass('d-block')
    $('#cerrarSesion').removeClass('d-none').addClass('d-block')
    $('#loginModal').addClass('d-none')


    //Control preventivo de acceso con email y password
    //Adquisición de token y datos
    if (email != "" || pass != "") {
        const token = await consult(email, pass)
        console.log(token)

        if (token) {
            $('#inputModal').modal('hide')
            //Muestra los link de Situación Chile y Cerrar sesión, y oculta Iniciar sesión.
            $('#situacionChile').removeClass('d-none').addClass('d-block')
            $('#cerrarSesion').removeClass('d-none').addClass('d-block')
            $('#loginModal').addClass('d-none')
        } else {
            alert(`Reinicie sesión para capturar Token.`)
        }

    } else {
        alert(`Debe ingresar su dirección de correo elecrónico y password.`)
    }
}

//Opción Situación Chile
document.getElementById("situacionChile").addEventListener("click", chileFunction);

function chileFunction() {
    //Oculta Gráfico Situación Mundial y Tabla de Datos
    $('#worldSituation').addClass('d-none')

    // Muestra gráfico de Situación Epidemiológica de Chile
    $('#chileGraph').removeClass('d-none').addClass('d-block')

}

//Opción Cerrar Sesión
document.getElementById("cerrarSesion").addEventListener("click", cierraSesionFunction);

function cierraSesionFunction() {
    //Elimina el JWT almacenado y vuelva la  aplicación a su estado inicial.
    localStorage.clear()

    //Oculta los link de Situación Chile y Cerrar sesión, y muestra Iniciar sesión.
    $('#chileGraph').removeClass('d-block').addClass('d-none')
    $('#worldSituation').removeClass('d-none').addClass('d-block')
    $('#situacionChile').removeClass('d-block').addClass('d-none')
    $('#cerrarSesion').removeClass('d-block').addClass('d-none')
    $('#loginModal').removeClass('d-none')

}