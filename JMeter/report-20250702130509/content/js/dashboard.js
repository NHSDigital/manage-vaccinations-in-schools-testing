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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.69812734082397, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.31690140845070425, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.4777777777777778, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4090909090909091, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.3076923076923077, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9571428571428572, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7708333333333334, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4852941176470588, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.9784172661870504, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.45714285714285713, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.48, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9888888888888889, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9272727272727272, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [1.0, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9928057553956835, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1092, 0, 0.0, 584.3214285714287, 84, 5632, 429.0, 1209.2000000000003, 1705.1499999999992, 2875.229999999994, 1.8076686867750495, 56.45391203993012, 2.3118158260607227], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 63, 0, 0.0, 5028.222222222223, 2854, 8201, 4866.0, 7239.8, 7431.599999999999, 8201.0, 0.12197553906411848, 38.61126121920844, 0.5219355097899891], "isController": true}, {"data": ["2.5 Select patient", 60, 0, 0.0, 325.63333333333327, 186, 829, 235.0, 605.7, 663.4499999999999, 829.0, 0.11912774663910845, 3.020068697621019, 0.08259833995485058], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 269.0285714285714, 234, 661, 245.0, 336.19999999999993, 418.5999999999987, 661.0, 0.5571296679507179, 8.004386401260705, 0.8052264732100219], "isController": false}, {"data": ["2.5 Select menacwy", 27, 0, 0.0, 270.00000000000006, 183, 452, 218.0, 444.2, 450.8, 452.0, 0.09276501590748236, 2.148371737763607, 0.06468185679486563], "isController": false}, {"data": ["2.3 Search by first/last name", 71, 0, 0.0, 1471.2535211267611, 616, 4513, 1215.0, 2637.599999999999, 3359.7999999999965, 4513.0, 0.13466353083984522, 11.813481600528222, 0.11616729928495562], "isController": false}, {"data": ["2.5 Select td_ipv", 25, 0, 0.0, 245.96000000000004, 183, 468, 217.0, 453.6, 465.3, 468.0, 0.33971545433544864, 7.978973842759306, 0.23654015521599112], "isController": false}, {"data": ["4.0 Vaccination for flu", 45, 0, 0.0, 1335.1333333333334, 1249, 1556, 1322.0, 1414.8, 1523.3999999999996, 1556.0, 0.1189563562346348, 6.234306951181633, 0.6950298753932168], "isController": true}, {"data": ["4.0 Vaccination for hpv", 44, 0, 0.0, 1467.9545454545453, 972, 2780, 1351.0, 2215.0, 2236.5, 2780.0, 0.13061961194100744, 6.531864807402867, 0.7527268235536847], "isController": true}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 787.0, 787, 787, 787.0, 787.0, 787.0, 787.0, 1.2706480304955527, 125.70108997776366, 2.7609295584498095], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 88.65714285714289, 84, 96, 88.0, 91.4, 92.79999999999998, 96.0, 0.619699357283238, 3.734535872846545, 0.37339306976929476], "isController": false}, {"data": ["5.9 Patient home page", 1, 0, 0.0, 219.0, 219, 219, 219.0, 219.0, 219.0, 219.0, 4.5662100456621, 111.27907391552512, 3.402361586757991], "isController": false}, {"data": ["2.4 Patient attending session", 65, 0, 0.0, 1614.215384615385, 811, 5632, 1328.0, 2560.7999999999997, 3603.8999999999965, 5632.0, 0.12581245814316297, 9.835264161401899, 0.18699859501356836], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 270.0, 270, 270, 270.0, 270.0, 270.0, 270.0, 3.7037037037037037, 23.227719907407405, 7.8305844907407405], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 277.0, 277, 277, 277.0, 277.0, 277.0, 277.0, 3.6101083032490977, 47.03364733754512, 5.616115749097473], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 261.97142857142853, 249, 331, 259.0, 272.4, 292.5999999999998, 331.0, 0.5997463929538367, 3.0953707878525654, 0.32505785946228455], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 436.3142857142857, 412, 542, 423.0, 498.6, 513.1999999999998, 542.0, 0.5487613671997492, 5.3252360408827215, 0.8633345337488241], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 25, 0, 0.0, 1568.5199999999998, 1271, 2497, 1398.0, 2149.6000000000004, 2408.7999999999997, 2497.0, 0.3318202330705317, 18.648543371393114, 1.9667736994305964], "isController": true}, {"data": ["2.1 Open session", 72, 0, 0.0, 515.1388888888889, 217, 1347, 481.0, 853.3000000000002, 1114.9499999999994, 1347.0, 0.13643960841832384, 2.3262575716876444, 0.08650539137796424], "isController": false}, {"data": ["4.3 Vaccination confirm", 136, 0, 0.0, 750.4191176470588, 525, 1793, 632.0, 1004.3, 1391.5, 1750.8199999999995, 0.33483104573151967, 7.010347102542007, 0.7794395696128515], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 266.0, 266, 266, 266.0, 266.0, 266.0, 266.0, 3.7593984962406015, 46.72080592105263, 9.262658599624059], "isController": false}, {"data": ["4.1 Vaccination questions", 139, 0, 0.0, 392.7769784172663, 264, 1948, 433.0, 457.0, 473.0, 1448.799999999993, 0.3193016711652214, 3.7064621259978177, 0.6270705615057716], "isController": false}, {"data": ["5.3 Consent parent details", 1, 0, 0.0, 422.0, 422, 422, 422.0, 422.0, 422.0, 422.0, 2.3696682464454977, 26.788359004739338, 4.271882405213271], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 1, 0, 0.0, 288.0, 288, 288, 288.0, 288.0, 288.0, 288.0, 3.472222222222222, 68.50179036458334, 5.405002170138889], "isController": false}, {"data": ["1.0 Login", 35, 0, 0.0, 1251.5142857142857, 1145, 1670, 1192.0, 1477.9999999999995, 1667.6, 1670.0, 0.5862941186324271, 27.092628319890444, 2.7911951448565255], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 25, 0, 0.0, 1382.8400000000004, 1235, 1940, 1379.0, 1434.2, 1793.2999999999997, 1940.0, 0.32118401274458164, 16.956546111585748, 1.9045082793208885], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 45, 0, 0.0, 297.17777777777775, 183, 804, 218.0, 462.6, 475.59999999999997, 804.0, 0.1167963538773794, 2.5533918512806073, 0.08702697071136765], "isController": false}, {"data": ["2.5 Select flu", 55, 0, 0.0, 312.74545454545455, 182, 851, 215.0, 585.8, 656.3999999999997, 851.0, 0.11224581425154491, 2.358260242813207, 0.07782668761581728], "isController": false}, {"data": ["5.1 Consent start", 1, 0, 0.0, 388.0, 388, 388, 388.0, 388.0, 388.0, 388.0, 2.577319587628866, 32.38009423324742, 5.479321037371134], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 281.0, 281, 281, 281.0, 281.0, 281.0, 281.0, 3.558718861209964, 90.39284919928825, 5.47014012455516], "isController": false}, {"data": ["1.5 Open Sessions list", 35, 0, 0.0, 195.54285714285717, 149, 539, 163.0, 290.9999999999999, 517.3999999999999, 539.0, 0.5514329378771408, 6.038836880228766, 0.3295673417781349], "isController": false}, {"data": ["4.2 Vaccination batch", 139, 0, 0.0, 300.73381294964, 257, 575, 278.0, 425.0, 450.0, 571.8, 0.31789739461358313, 6.455365612021096, 0.5107785834640753], "isController": false}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 315.0, 315, 315, 315.0, 315.0, 315.0, 315.0, 3.1746031746031744, 58.705357142857146, 5.254836309523809], "isController": false}, {"data": ["5.0 Consent for flu", 1, 0, 0.0, 3243.0, 3243, 3243, 3243.0, 3243.0, 3243.0, 3243.0, 0.3083564600678384, 72.84680465618256, 4.815058395004626], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 102.0, 102, 102, 102.0, 102.0, 102.0, 102.0, 9.803921568627452, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 72, 0, 0.0, 1141.4166666666667, 555, 2664, 1027.0, 1996.4000000000005, 2334.25, 2664.0, 0.13608502289819518, 14.269430522571213, 0.0874766369657954], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1092, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
