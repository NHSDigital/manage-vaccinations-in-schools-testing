/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7011660825020221, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.980565371024735, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9577836411609498, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.5783132530120482, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9686648501362398, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.2655109489051095, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.26033834586466165, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.47674418604651164, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8214285714285714, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.25277777777777777, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.27835051546391754, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.47929490766648014, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.9251925192519251, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4785714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2801608579088472, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.953125, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9425795053003534, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9939024390243902, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9553226696083839, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.538659793814433, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12368, 0, 0.0, 485.03775873221366, 0, 4249, 388.0, 964.1000000000004, 1296.5499999999993, 2270.859999999997, 3.43187486975774, 71.37954867840006, 4.2175274830244565], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 579, 0, 0.0, 4141.424870466322, 2084, 8267, 3938.0, 5397.0, 5881.0, 7236.200000000008, 0.16533244242276277, 31.533978023224353, 0.7115028855543991], "isController": true}, {"data": ["2.5 Select patient", 566, 0, 0.0, 250.8886925795053, 179, 1959, 199.5, 404.60000000000014, 464.0499999999996, 721.0400000000036, 0.1625354613034942, 4.635246435329552, 0.11269548586472743], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 239.3857142857142, 214, 378, 231.5, 267.4, 318.6, 378.0, 0.0790832667715838, 1.1362813515725707, 0.11430003400580471], "isController": false}, {"data": ["2.5 Select menacwy", 379, 0, 0.0, 297.3403693931397, 178, 3178, 208.0, 468.0, 543.0, 1400.9999999999995, 0.11546661613351962, 2.9196922901318088, 0.08051090226497365], "isController": false}, {"data": ["2.3 Search by first/last name", 581, 0, 0.0, 685.7710843373494, 414, 3489, 601.0, 934.8000000000001, 1150.8999999999996, 2034.739999999978, 0.16542413495420513, 7.99800406643345, 0.1426929974340752], "isController": false}, {"data": ["2.5 Select td_ipv", 367, 0, 0.0, 294.39509536784703, 180, 3187, 214.0, 455.2, 545.9999999999993, 1193.3599999999974, 0.11576983946477111, 2.9671547884156344, 0.08060927298670098], "isController": false}, {"data": ["4.0 Vaccination for flu", 548, 0, 0.0, 1595.2645985401457, 538, 5241, 1479.0, 2014.2, 2295.2, 3622.9699999999984, 0.15974082342896503, 8.705019740598976, 0.9687939683519324], "isController": true}, {"data": ["4.0 Vaccination for hpv", 532, 0, 0.0, 1621.4172932330828, 541, 4349, 1492.0, 2107.1, 2680.8499999999995, 3585.35, 0.15887151057540752, 8.217091465979399, 0.9652827767305796], "isController": true}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 786.0, 786, 786, 786.0, 786.0, 786.0, 786.0, 1.272264631043257, 127.60913645038167, 2.764442191475827], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 94.22857142857143, 88, 112, 93.0, 101.9, 107.80000000000001, 112.0, 0.0788678186626046, 0.47528643453802044, 0.047520941518385776], "isController": false}, {"data": ["5.9 Patient home page", 1, 0, 0.0, 446.0, 446, 446, 446.0, 446.0, 446.0, 446.0, 2.242152466367713, 56.150154147982065, 1.6706663396860986], "isController": false}, {"data": ["2.4 Patient attending session", 559, 0, 0.0, 913.3041144901607, 631, 3929, 813.0, 1200.0, 1452.0, 2886.7999999999984, 0.15957322298516682, 7.158888339582809, 0.23717816931974992], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 300.0, 300, 300, 300.0, 300.0, 300.0, 300.0, 3.3333333333333335, 20.904947916666668, 7.047526041666667], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 263.5, 257, 270, 263.5, 270.0, 270.0, 270.0, 0.009645201271237526, 0.11767804890840435, 0.015254300252704273], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 284.67142857142846, 258, 388, 273.5, 325.6, 344.6, 388.0, 0.07890151062577914, 0.4072211754465262, 0.04276400234112054], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 516.6999999999999, 436, 1648, 474.0, 627.6, 670.8000000000001, 1648.0, 0.07913494203365495, 0.767933514637138, 0.12449842931271302], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 360, 0, 0.0, 1650.4249999999986, 553, 5002, 1498.0, 2125.3000000000006, 2937.65, 3926.2299999999937, 0.11491152610486635, 6.485792441654471, 0.698013020613053], "isController": true}, {"data": ["2.1 Open session", 582, 0, 0.0, 1562.975945017182, 730, 3680, 1433.5, 2400.1000000000004, 2867.65, 3347.379999999999, 0.16490648357324583, 2.890158455615363, 0.10767643399929673], "isController": false}, {"data": ["4.3 Vaccination confirm", 1787, 0, 0.0, 848.4566312255175, 544, 4249, 810.0, 1142.4, 1425.3999999999992, 2356.24, 0.5247874713525362, 11.095540214115932, 1.2213687568425002], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 250.5, 248, 253, 250.5, 253.0, 253.0, 253.0, 0.00989021857383048, 0.12172019489911977, 0.024624133060528137], "isController": false}, {"data": ["4.1 Vaccination questions", 1818, 0, 0.0, 417.7931793179325, 255, 4076, 423.0, 536.0, 604.0999999999999, 1916.1899999999946, 0.5272205904870614, 6.31482815659191, 1.1385217341287173], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 348.5, 252, 445, 348.5, 445.0, 445.0, 445.0, 0.009648272235649402, 0.10908012467979797, 0.017699491596354883], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 2, 0, 0.0, 270.0, 266, 274, 270.0, 274.0, 274.0, 274.0, 0.009811135638950209, 0.20591408357861174, 0.015526313772381653], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1285.9142857142851, 1157, 2389, 1252.0, 1393.8999999999999, 1482.9, 2389.0, 0.07881303072131937, 3.6421010026987832, 0.3752085202797187], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 373, 0, 0.0, 1570.4504021447735, 525, 5351, 1471.0, 1991.8000000000002, 2328.7000000000003, 3095.6, 0.11544495674218666, 6.130551803680435, 0.7016127107218653], "isController": true}, {"data": ["Calculate site depending on vaccination", 1844, 0, 0.0, 0.18058568329718014, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.5292435777554677, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 544, 0, 0.0, 329.83272058823485, 181, 3572, 243.5, 491.0, 582.5, 1271.1499999999903, 0.16035528127465942, 3.844579586183152, 0.11948347618414563], "isController": false}, {"data": ["2.5 Select flu", 566, 0, 0.0, 315.38339222614803, 176, 2794, 231.0, 506.0, 574.65, 724.2200000000014, 0.16243741065583672, 3.8543364178863104, 0.1126275015289493], "isController": false}, {"data": ["5.1 Consent start", 2, 0, 0.0, 401.0, 367, 435, 401.0, 435.0, 435.0, 435.0, 0.00977689133962965, 0.13368275790217243, 0.02103845709655658], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 429.5, 366, 493, 429.5, 493.0, 493.0, 493.0, 0.009688936687643215, 0.15976810589765578, 0.015143694500559537], "isController": false}, {"data": ["1.5 Open Sessions list", 82, 0, 0.0, 156.0975609756098, 131, 578, 140.0, 163.4, 278.2999999999998, 578.0, 0.024186714355788338, 0.264896485840006, 0.014638538771450592], "isController": false}, {"data": ["4.2 Vaccination batch", 1813, 0, 0.0, 354.47600661886395, 252, 2480, 284.0, 476.0, 567.3, 1431.339999999998, 0.527316630222776, 11.054527917096403, 0.8537759191902534], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 353.5, 304, 403, 353.5, 403.0, 403.0, 403.0, 0.009817589192797816, 0.15963649302214847, 0.01645692563421626], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 3490.0, 3490, 3490, 3490.0, 3490.0, 3490.0, 3490.0, 0.28653295128939826, 65.92132655802291, 4.475958094555874], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 94.0, 94, 94, 94.0, 94.0, 94.0, 94.0, 10.638297872340425, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 582, 0, 0.0, 760.1460481099654, 431, 3522, 700.5, 1035.7, 1230.25, 2173.159999999998, 0.16493190607723063, 8.78509036114703, 0.1091426305689669], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12368, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
