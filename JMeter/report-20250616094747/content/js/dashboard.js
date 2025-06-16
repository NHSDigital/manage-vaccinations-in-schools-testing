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

    var data = {"OkPercent": 95.00612745098039, "KoPercent": 4.993872549019608};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.47808628525182095, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.8037974683544303, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.3827930174563591, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3841698841698842, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9810126582278481, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.018518518518518517, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.29936305732484075, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.6447876447876448, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9620253164556962, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5189873417721519, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.20030272452068618, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8083735909822867, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.3706467661691542, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6235521235521235, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.33158396946564883, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6529850746268657, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9299516908212561, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.42028985507246375, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.582089552238806, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.8568738229755178, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.813375796178344, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.581081081081081, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9270334928229665, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6260364842454395, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5366795366795367, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.38840399002493764, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.4869402985074627, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13056, 652, 4.993872549019608, 1006.1548713235321, 0, 32753, 612.0, 1640.0, 2560.749999999998, 9087.780000000013, 4.468874474121705, 124.74579647671382, 4.9644120683014545], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 991, 189, 19.071644803229063, 7559.294651866798, 153, 42633, 5936.0, 16900.4, 24652.799999999996, 33056.60000000001, 0.35778782423844624, 64.12362112293478, 1.294561138235532], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 312.0, 312, 312, 312.0, 312.0, 312.0, 312.0, 3.205128205128205, 48.58085436698718, 1.946864983974359], "isController": false}, {"data": ["1.4 Select Organisations", 79, 9, 11.39240506329114, 472.5443037974683, 151, 1983, 455.0, 536.0, 657.0, 1983.0, 0.03073785242017788, 0.40703222545261486, 0.04199780987937922], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 337.0, 337, 337, 337.0, 337.0, 337.0, 337.0, 2.967359050445104, 34.1738918768546, 1.8024387982195844], "isController": false}, {"data": ["2.3 Search by first/last name", 802, 0, 0.0, 1776.0723192019955, 644, 26787, 1080.5, 2479.600000000003, 5326.549999999997, 18389.93000000001, 0.29009611151844333, 18.920301685826452, 0.2502762830875052], "isController": false}, {"data": ["5.8 Consent confirm", 259, 0, 0.0, 1474.3513513513506, 838, 8026, 1209.0, 2157.0, 3142.0, 6012.399999999964, 0.13221652063292405, 11.135465046086901, 0.29230700934525766], "isController": false}, {"data": ["1.2 Sign-in page", 79, 0, 0.0, 198.69620253164564, 152, 887, 158.0, 424.0, 461.0, 887.0, 0.03069407064376345, 0.2156522543435024, 0.02094964419161337], "isController": false}, {"data": ["3.0 Nurse triage", 621, 0, 0.0, 2227.2801932367174, 1260, 10282, 2049.0, 2729.8000000000006, 3266.099999999999, 6300.299999999997, 0.28073658770780613, 33.15302935220259, 0.8439085641837979], "isController": true}, {"data": ["2.4 Patient attending session", 785, 0, 0.0, 2549.589808917198, 891, 32753, 1350.0, 4548.6, 10051.599999999997, 20293.079999999994, 0.2836393567131654, 16.13829570493684, 0.42158115323968537], "isController": false}, {"data": ["5.4 Consent route", 259, 0, 0.0, 652.5752895752889, 349, 7780, 523.0, 807.0, 1054.0, 3222.1999999999784, 0.13241681131115648, 1.5063725390731846, 0.2110238153744098], "isController": false}, {"data": ["1.1 Homepage", 79, 0, 0.0, 480.7721518987341, 340, 1315, 466.0, 492.0, 515.0, 1315.0, 0.03068478337708181, 0.19046444381305433, 0.019269782994493053], "isController": false}, {"data": ["1.3 Sign-in", 79, 0, 0.0, 656.3417721518986, 334, 1083, 608.0, 887.0, 965.0, 1083.0, 0.030766630434740278, 0.31650843981735527, 0.04853685443138788], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 6539.0, 6539, 6539, 6539.0, 6539.0, 6539.0, 6539.0, 0.1529285823520416, 1519.7204692517969, 0.09572970828872916], "isController": false}, {"data": ["2.1 Open session", 991, 189, 19.071644803229063, 2129.4106962663986, 153, 25758, 1261.0, 4183.400000000003, 6638.5999999999985, 18537.800000000007, 0.3583348098222066, 5.269156341414247, 0.23124506487360652], "isController": false}, {"data": ["3.3 Nurse triage complete", 621, 0, 0.0, 575.5104669887276, 212, 6611, 434.0, 870.8000000000001, 976.9, 2778.6799999999794, 0.28096686988881225, 6.530245347617324, 0.1903369566446855], "isController": false}, {"data": ["4.3 Vaccination confirm", 603, 0, 0.0, 1415.8192371475957, 772, 6829, 1230.0, 1924.6, 2372.599999999999, 5404.76000000001, 0.2818074371926932, 7.035903433663558, 0.6559724935728743], "isController": false}, {"data": ["5.6 Consent questions", 259, 0, 0.0, 678.1196911196918, 352, 4016, 543.0, 890.0, 954.0, 3681.1999999999925, 0.13204671904689802, 1.5858381980950604, 0.26111211059600997], "isController": false}, {"data": ["4.1 Vaccination questions", 1048, 445, 42.461832061068705, 715.0152671755724, 151, 21460, 508.5, 889.2, 1427.55, 4672.959999999999, 0.3845850389814368, 3.297494033289725, 0.6956480486116591], "isController": false}, {"data": ["5.3 Consent parent details", 268, 9, 3.3582089552238807, 597.4402985074629, 183, 4885, 513.0, 650.9999999999998, 918.3999999999999, 3372.2800000000016, 0.13577223498323618, 1.5547101353023516, 0.22743897579479952], "isController": false}, {"data": ["3.1 Nurse triage new", 621, 0, 0.0, 387.1320450885669, 177, 3642, 321.0, 582.0, 631.4999999999999, 1621.5999999999885, 0.28162728873191534, 3.161617783244038, 0.19408466766165905], "isController": false}, {"data": ["3.2 Nurse triage result", 621, 0, 0.0, 1264.6360708534614, 577, 9743, 1259.0, 1663.8000000000006, 2012.9999999999998, 4423.399999999998, 0.28100450285959416, 23.498922010051, 0.4606960082201736], "isController": false}, {"data": ["5.2 Consent who", 268, 0, 0.0, 642.2499999999999, 349, 3581, 541.0, 902.6999999999999, 1102.75, 2936.4400000000014, 0.13591152768107043, 2.0327146028125065, 0.21683928693230944], "isController": false}, {"data": ["1.0 Login", 79, 9, 11.39240506329114, 2175.3670886075947, 1285, 10427, 2030.0, 2242.0, 2445.0, 10427.0, 0.030651115041006535, 5.28686494357285, 0.1473489762091089], "isController": true}, {"data": ["5.0 Consent", 268, 9, 3.3582089552238807, 6767.95149253731, 1148, 18102, 6338.5, 8666.699999999999, 10259.499999999998, 13579.060000000007, 0.13593751743601554, 27.06212961940285, 2.026315647232505], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 531, 0, 0.0, 501.7928436911485, 206, 4255, 394.0, 791.8, 905.1999999999999, 2646.1999999999643, 0.25793940901272355, 5.785936290150017, 0.18636405029599884], "isController": false}, {"data": ["4.0 Vaccination", 1048, 445, 42.461832061068705, 1912.1889312977119, 151, 21460, 2179.0, 3270.6000000000004, 4380.0999999999985, 7596.739999999998, 0.3841932345331062, 12.689741234125451, 1.5661171341659232], "isController": true}, {"data": ["2.5 Patient return to consent page", 785, 0, 0.0, 716.564331210191, 200, 20950, 389.0, 849.0, 1214.8999999999996, 12929.479999999974, 0.28352216150072435, 4.978546376347498, 0.1965827486967913], "isController": false}, {"data": ["5.5 Consent agree", 259, 0, 0.0, 741.8146718146716, 391, 4090, 582.0, 1025.0, 1154.0, 2131.799999999973, 0.13234657633714753, 2.2979658372734972, 0.20845623722842765], "isController": false}, {"data": ["Debug Sampler", 1405, 0, 0.0, 0.274733096085409, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.5084275944824931, 2.1605787390823767, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 418, 0, 0.0, 423.48086124401914, 172, 13712, 311.0, 579.6000000000001, 640.0999999999999, 2730.34, 0.16203472194764185, 1.7544531050727334, 0.10382317873747816], "isController": false}, {"data": ["4.2 Vaccination batch", 603, 0, 0.0, 664.6384742951906, 348, 4215, 534.0, 840.0, 1087.3999999999992, 3493.1600000000044, 0.2783391232179141, 4.880924215855683, 0.44902170851870044], "isController": false}, {"data": ["5.7 Consent triage", 259, 0, 0.0, 786.2277992277993, 365, 4343, 613.0, 1094.0, 1452.0, 3017.7999999999965, 0.13208948220922975, 2.15457122204956, 0.2232735388302278], "isController": false}, {"data": ["2.2 Session register", 802, 0, 0.0, 1701.194513715711, 648, 29953, 1098.0, 2198.0000000000005, 3862.049999999997, 16289.91000000001, 0.2905098193767876, 17.69856067122801, 0.19275784682145308], "isController": false}, {"data": ["5.1 Consent homepage", 268, 0, 0.0, 887.8656716417913, 526, 4744, 763.5, 1152.0, 1342.55, 3047.570000000001, 0.13641328746860712, 1.713527889073092, 0.2957869664420768], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 0.14241536458333334, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 463, 71.0122699386503, 3.546262254901961], "isController": false}, {"data": ["404/Not Found", 189, 28.987730061349694, 1.447610294117647], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13056, 652, "422/Unprocessable Entity", 463, "404/Not Found", 189, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 79, 9, "422/Unprocessable Entity", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 991, 189, "404/Not Found", 189, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1048, 445, "422/Unprocessable Entity", 445, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 268, 9, "422/Unprocessable Entity", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
