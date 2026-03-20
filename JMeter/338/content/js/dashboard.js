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

    var data = {"OkPercent": 99.97116978593566, "KoPercent": 0.028830214064339426};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7692008868507324, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4964871194379391, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9974549725920125, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.824607329842932, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9976662777129521, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4984732824427481, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.49362041467304624, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7893523853422447, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.49754901960784315, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.3294930875576037, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.9283752860411899, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7882623705408516, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7874451880913916, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.47096032202415183, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.494299674267101, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.970314318975553, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7752718485702779, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9928429423459244, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.34294280442804426, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4991869918699187, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.48796561604584526, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.4541284403669725, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4454022988505747, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.271505376344086, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8312015503875969, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9948227797690163, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9931959564541213, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9896373056994818, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.3619791666666667, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 41623, 12, 0.028830214064339426, 453.6680441102271, 0, 60011, 185.0, 1146.0, 1434.9000000000015, 3117.0, 10.56869818867296, 488.01877667256576, 82.1660108482267], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 2562, 10, 0.39032006245121, 968.92701014832, 339, 3238, 949.0, 1304.7000000000003, 1423.85, 1763.9599999999991, 0.7170822310269894, 106.25636272283569, 26.253486191776254], "isController": true}, {"data": ["2.5 Select patient", 2554, 0, 0.0, 118.42404072043843, 55, 889, 97.0, 203.0, 264.75, 436.4499999999998, 0.719955799111472, 18.086934642922078, 5.195574077274739], "isController": false}, {"data": ["7.1 Full name search", 191, 0, 0.0, 547.9581151832458, 241, 3005, 382.0, 1068.2000000000014, 1519.199999999995, 2826.519999999997, 0.0542274560707921, 1.9776524545660512, 0.4004343182714445], "isController": false}, {"data": ["2.3 Search by first/last name", 2571, 0, 0.0, 115.49436017113958, 59, 1036, 92.0, 193.0, 249.0, 435.8400000000006, 0.7193055050792033, 20.794900396139113, 5.382506256153335], "isController": false}, {"data": ["4.0 Vaccination for flu", 655, 0, 0.0, 820.2122137404582, 233, 2032, 762.0, 1139.6, 1280.0, 1626.5599999999972, 0.1869443756286183, 9.820394974935184, 5.316142327085728], "isController": true}, {"data": ["4.0 Vaccination for hpv", 627, 0, 0.0, 831.7145135566185, 219, 1984, 777.0, 1159.2, 1299.4, 1627.4800000000002, 0.17925855573640243, 8.742942610137515, 5.103853045347697], "isController": true}, {"data": ["1.2 Sign-in page", 4339, 0, 0.0, 625.2131827610032, 11, 11132, 158.0, 1439.0, 2718.0, 5762.400000000003, 1.2054220935895381, 69.95948600243877, 10.433519631968439], "isController": false}, {"data": ["7.7 Due vaccination search", 204, 0, 0.0, 750.9901960784316, 536, 6531, 671.0, 949.0, 1040.5, 1389.4499999999991, 0.058167899360409725, 7.6477321629847435, 0.44096288795351357], "isController": false}, {"data": ["7.2 First name search", 217, 0, 0.0, 1883.986175115207, 929, 8081, 1323.0, 3355.8, 5815.7, 7757.019999999995, 0.06425277574952196, 8.555328454748873, 0.47404667858674093], "isController": false}, {"data": ["2.4 Patient attending session", 2185, 10, 0.4576659038901602, 373.8572082379854, 62, 2795, 334.0, 536.0, 663.0999999999995, 907.5599999999995, 0.6134783294746435, 18.487998766568126, 5.384235836406808], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 4345, 0, 0.0, 622.8451093210576, 25, 10608, 161.0, 1459.8000000000002, 2716.0999999999995, 5733.819999999999, 1.206839851657301, 84.4251221209266, 10.427885583683443], "isController": false}, {"data": ["1.3 Sign-in", 4333, 0, 0.0, 634.3655665820434, 56, 10836, 176.0, 1469.6, 2697.500000000001, 5712.66, 1.2051181783441403, 70.22605780635256, 10.773682506915593], "isController": false}, {"data": ["Run some searches", 1739, 2, 0.11500862564692352, 1500.140310523288, 0, 60011, 1150.0, 2828.0, 3371.0, 6905.799999999972, 0.48674848930230946, 55.52693761419976, 3.641382391250619], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 614, 0, 0.0, 829.3338762214981, 226, 1958, 780.5, 1152.0, 1319.5, 1671.1000000000015, 0.17674618901824687, 8.773401103670563, 5.032978281412461], "isController": true}, {"data": ["2.1 Open session", 2577, 0, 0.0, 280.3418703919289, 103, 1328, 251.0, 438.2000000000003, 528.0, 798.0, 0.7192481637820453, 16.391255742018775, 5.194502839941745], "isController": false}, {"data": ["4.3 Vaccination confirm", 2483, 0, 0.0, 533.889649617399, 321, 1766, 479.0, 770.0, 917.3999999999992, 1237.3999999999942, 0.7175104036118832, 15.133325478941083, 7.400474576746883], "isController": false}, {"data": ["4.1 Vaccination questions", 2515, 0, 0.0, 155.23061630218675, 71, 1343, 117.0, 265.0, 351.1999999999998, 543.3600000000006, 0.7171680331830654, 10.078230630350065, 6.72841687571592], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 4336, 0, 0.0, 2163.5719557195566, 312, 25125, 954.0, 4289.800000000001, 8253.3, 17700.610000000004, 1.2058241081949042, 283.52820723471524, 36.80522274565677], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 615, 0, 0.0, 822.273170731707, 187, 2039, 768.0, 1091.0, 1282.1999999999996, 1564.7200000000003, 0.17591970967240889, 9.333924468550848, 5.000931455978024], "isController": true}, {"data": ["7.0 Open Children Search", 1745, 0, 0.0, 1326.626934097424, 75, 8113, 1090.0, 2783.6000000000004, 3207.0999999999995, 6160.86, 0.48669916720054823, 54.18466677501766, 3.5125956049217417], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.8 Year group search", 218, 0, 0.0, 1305.559633027524, 1108, 2463, 1235.0, 1491.8999999999999, 1917.5499999999997, 2419.2, 0.06359667803627461, 8.617621659460502, 0.4845605799564859], "isController": false}, {"data": ["7.9 DOB search", 174, 0, 0.0, 1078.327586206896, 678, 4520, 899.5, 1586.0, 2215.25, 4303.25, 0.04890358994508464, 6.5942561758699565, 0.3687017678682897], "isController": false}, {"data": ["7.4 Partial name search", 186, 0, 0.0, 2614.0913978494636, 934, 14367, 1410.5, 5976.3, 6920.950000000002, 13371.719999999994, 0.05339667442066762, 7.092669015635896, 0.3938512172898719], "isController": false}, {"data": ["Debug Sampler", 2571, 0, 0.0, 0.3068844807467911, 0, 20, 0.0, 1.0, 1.0, 1.0, 0.719324020078401, 4.12391082809275, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 2580, 0, 0.0, 475.48062015503893, 324, 1831, 428.5, 635.0, 720.9499999999998, 936.5700000000002, 0.7190200592662038, 59.16401004750409, 5.188209324697335], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 2511, 0, 0.0, 142.7729988052568, 70, 1202, 109.0, 241.80000000000018, 317.4000000000001, 508.28000000000065, 0.7172388105318422, 11.550665285145273, 6.363241691269681], "isController": false}, {"data": ["7.5 Needs Consent search", 163, 2, 1.2269938650306749, 3836.2822085889584, 2431, 60011, 2717.0, 3126.0, 3638.199999999997, 60009.72, 0.04764904577670137, 6.368647014663044, 0.3582413939392168], "isController": false}, {"data": ["2.2 Session register", 2572, 0, 0.0, 136.33709175738707, 58, 913, 95.0, 266.0, 339.3499999999999, 527.1599999999999, 0.7187808894829668, 28.72793119141915, 5.197436610449263], "isController": false}, {"data": ["7.6 Needs triage search", 193, 0, 0.0, 197.9170984455958, 120, 803, 172.0, 299.4, 330.89999999999975, 775.74, 0.054959324404673764, 2.99147474848634, 0.41710626636321335], "isController": false}, {"data": ["7.3 Last name search", 192, 0, 0.0, 1667.0937500000007, 963, 7171, 1297.0, 3044.1000000000004, 3848.349999999998, 7111.48, 0.05636545009279749, 7.544619907238468, 0.4158740886851643], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 2, 16.666666666666668, 0.004805035677389905], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, 83.33333333333333, 0.024025178386949522], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 41623, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "504/Gateway Time-out", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 2185, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 163, 2, "504/Gateway Time-out", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
