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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7640042679673805, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.01138353765323993, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9927797833935018, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9886934673366834, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9075043630017452, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9818652849740933, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.44799270072992703, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.45038167938931295, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.759927797833935, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9214285714285714, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.44312169312169314, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6727430555555556, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4936778449697636, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.9837221920781335, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4785714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.44087403598971725, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9860335195530726, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9855595667870036, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9941860465116279, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9921152800435019, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.8452173913043478, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10630, 0, 0.0, 405.9191909689551, 88, 3479, 326.5, 751.0, 830.0, 1217.380000000001, 2.949689616620821, 64.60619174415037, 4.184638555669079], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 571, 0, 0.0, 2154.6637478108587, 1095, 4927, 2098.0, 2616.6000000000004, 2848.5999999999995, 3932.6799999999976, 0.16266879380092303, 25.347102005850807, 0.7011302552205003], "isController": true}, {"data": ["2.5 Select patient", 554, 0, 0.0, 205.71119133574, 165, 1691, 182.0, 235.5, 325.75, 579.1500000000003, 0.15888575769864594, 4.15332035563164, 0.11016492965433457], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 216.11428571428573, 207, 245, 215.0, 225.0, 231.60000000000002, 245.0, 0.07806279371126133, 1.1215427940235125, 0.1128251315358074], "isController": false}, {"data": ["2.5 Select menacwy", 398, 0, 0.0, 249.92211055276383, 168, 1660, 187.0, 433.0, 447.0, 705.149999999999, 0.12083887684210974, 2.798719614563453, 0.08425679498561167], "isController": false}, {"data": ["2.3 Search by first/last name", 573, 0, 0.0, 367.45026178010454, 254, 1456, 303.0, 556.2, 644.8999999999999, 1006.3199999999988, 0.16258363268016138, 5.718235431137461, 0.14026590129286617], "isController": false}, {"data": ["2.5 Select td_ipv", 386, 0, 0.0, 250.95595854922286, 167, 1144, 188.0, 429.6, 465.2499999999999, 778.2699999999996, 0.1208753630958122, 2.8390007025684763, 0.08416419324933018], "isController": false}, {"data": ["4.0 Vaccination for flu", 548, 0, 0.0, 1345.2773722627762, 534, 3094, 1288.0, 1517.6000000000001, 1769.4999999999995, 2476.06, 0.1594199441332006, 8.333948662105211, 0.9373524074593407], "isController": true}, {"data": ["4.0 Vaccination for hpv", 524, 0, 0.0, 1344.948473282442, 501, 2853, 1298.0, 1501.5, 1713.5, 2508.5, 0.1566705943944816, 8.026190613360892, 0.9237274606626747], "isController": true}, {"data": ["5.8 Consent confirm", 6, 0, 0.0, 883.0, 742, 1187, 830.0, 1187.0, 1187.0, 1187.0, 0.002805285157236233, 0.28575920367305335, 0.0061680659487474395], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 91.91428571428575, 88, 139, 90.0, 95.9, 97.9, 139.0, 0.07887537240443686, 0.4753319561599412, 0.047525492942907754], "isController": false}, {"data": ["5.9 Patient home page", 6, 0, 0.0, 189.5, 179, 204, 186.5, 204.0, 204.0, 204.0, 0.0028051828558444585, 0.06637836984278819, 0.0020901899599700406], "isController": false}, {"data": ["2.4 Patient attending session", 554, 0, 0.0, 535.1191335740078, 447, 2180, 497.5, 622.5, 730.25, 1291.6500000000026, 0.15798491101514145, 5.41054374880941, 0.23481741656742702], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 291.0, 291, 291, 291.0, 291.0, 291.0, 291.0, 3.4364261168384878, 21.551492697594504, 7.265490764604811], "isController": false}, {"data": ["5.4 Consent route", 6, 0, 0.0, 255.83333333333334, 246, 275, 252.0, 275.0, 275.0, 275.0, 0.0028094070184606136, 0.034272113515729404, 0.004443197916403285], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 279.0428571428571, 260, 380, 271.0, 304.6, 326.15000000000003, 380.0, 0.07891040512601992, 0.4072670811435696, 0.04276882309076275], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 480.9428571428571, 403, 1233, 450.0, 580.4, 650.7500000000002, 1233.0, 0.0781055607811895, 0.7579442944166798, 0.12287896329931279], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 378, 0, 0.0, 1352.1746031746036, 659, 4179, 1312.0, 1517.1, 1644.6000000000001, 2262.4299999999903, 0.12020667916646527, 6.73061535375188, 0.709623499682311], "isController": true}, {"data": ["2.1 Open session", 576, 0, 0.0, 648.1909722222222, 240, 2297, 576.5, 1061.2000000000003, 1263.0999999999997, 1851.1600000000017, 0.16247343234998357, 2.8272507643267857, 0.10607722653478863], "isController": false}, {"data": ["4.3 Vaccination confirm", 1819, 0, 0.0, 705.9252336448601, 503, 3479, 627.0, 880.0, 996.0, 1568.1999999999998, 0.5344352277137718, 11.24989517052274, 1.2438567217790142], "isController": false}, {"data": ["5.6 Consent questions", 6, 0, 0.0, 337.33333333333337, 241, 484, 325.5, 484.0, 484.0, 484.0, 0.0028049363139209926, 0.03451432133280289, 0.006983579230802315], "isController": false}, {"data": ["4.1 Vaccination questions", 1843, 0, 0.0, 359.3906673901249, 244, 1383, 410.0, 446.0, 470.0, 668.9199999999996, 0.5348159992106893, 6.214644421630449, 1.0561884280566562], "isController": false}, {"data": ["5.3 Consent parent details", 6, 0, 0.0, 265.0, 238, 368, 244.0, 368.0, 368.0, 368.0, 0.002804899598618867, 0.03170668732475221, 0.005149163830211948], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 6, 0, 0.0, 284.8333333333333, 258, 322, 278.0, 322.0, 322.0, 322.0, 0.0028059411126491827, 0.05661981792365034, 0.004440456614304688], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1211.7428571428566, 1086, 2013, 1168.0, 1326.0, 1571.0000000000014, 2013.0, 0.07883024919367916, 3.642742735933305, 0.37529049298748623], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 1345.7634961439587, 524, 2812, 1299.0, 1517.0, 1691.0, 2208.1, 0.11986273405971999, 6.314568489150266, 0.7086491164629771], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 537, 0, 0.0, 270.75977653631264, 168, 1123, 192.0, 435.0, 454.19999999999993, 785.1600000000001, 0.1581920038508117, 3.455429485766991, 0.11787158099430597], "isController": false}, {"data": ["2.5 Select flu", 554, 0, 0.0, 273.90433212996373, 165, 2004, 192.0, 438.5, 467.5, 594.4500000000019, 0.15890562784072493, 3.3606172233227856, 0.11017870680362764], "isController": false}, {"data": ["5.1 Consent start", 6, 0, 0.0, 416.0, 353, 554, 359.5, 554.0, 554.0, 554.0, 0.0028046544174943123, 0.036313975189793304, 0.006035210946238982], "isController": false}, {"data": ["5.5 Consent agree", 6, 0, 0.0, 273.1666666666667, 239, 404, 249.0, 404.0, 404.0, 404.0, 0.0028055225776767376, 0.057737417202014925, 0.004384998911691033], "isController": false}, {"data": ["1.5 Open Sessions list", 86, 0, 0.0, 141.76744186046506, 121, 786, 129.0, 150.6, 176.2999999999998, 786.0, 0.024395488309738738, 0.2671591854545021, 0.014815029010774295], "isController": false}, {"data": ["4.2 Vaccination batch", 1839, 0, 0.0, 289.12615551930446, 236, 1707, 256.0, 414.0, 432.0, 592.7999999999997, 0.5345439198027159, 10.897430779251092, 0.8654926929314052], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 3195.3333333333335, 3007, 3425, 3154.0, 3425.0, 3425.0, 3425.0, 0.0015346657983868618, 0.3453372720637623, 0.02459561716073527], "isController": true}, {"data": ["5.7 Consent triage", 6, 0, 0.0, 367.16666666666663, 271, 548, 298.5, 548.0, 548.0, 548.0, 0.002807068760552824, 0.048431073713157816, 0.004705403835438401], "isController": false}, {"data": ["5.0 Consent for flu", 3, 0, 0.0, 3348.3333333333335, 3049, 3510, 3486.0, 3510.0, 3510.0, 3510.0, 0.0015470432651276335, 0.3706175809606417, 0.02416852225911634], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 89.0, 89, 89, 89.0, 89.0, 89.0, 89.0, 11.235955056179774, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 575, 0, 0.0, 420.8921739130435, 258, 1282, 358.0, 659.5999999999999, 756.1999999999999, 1049.0400000000002, 0.1623798389191998, 7.189418387628209, 0.10744151060552148], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10630, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
