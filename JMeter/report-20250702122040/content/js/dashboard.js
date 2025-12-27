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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7450153374233128, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12903225806451613, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9912280701754386, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.90625, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.9328358208955224, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.43902439024390244, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2804878048780488, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.25925925925925924, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7928571428571428, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7226277372262774, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.4714285714285714, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2777777777777778, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.8048780487804879, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9705882352941176, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.7428571428571429, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1066, 0, 0.0, 377.9080675422142, 87, 1322, 307.0, 615.6000000000001, 887.5499999999998, 964.3199999999997, 1.7673908105625642, 39.601963636887405, 2.2568030064917624], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 62, 0, 0.0, 1669.467741935484, 737, 2356, 1792.0, 1970.7, 2078.5999999999995, 2356.0, 0.12124222436460275, 21.59492679511824, 0.5151839691868754], "isController": true}, {"data": ["2.5 Select patient", 57, 0, 0.0, 207.49122807017542, 172, 531, 203.0, 237.0, 270.5999999999998, 531.0, 0.11388452109560905, 2.8979169809313357, 0.07907411572165823], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 277.5142857142857, 250, 476, 264.0, 314.5999999999999, 398.3999999999996, 476.0, 0.5535172064777328, 7.953026034088753, 0.8027080582221028], "isController": false}, {"data": ["2.5 Select menacwy", 32, 0, 0.0, 273.56250000000006, 174, 547, 206.5, 540.0, 545.7, 547.0, 0.11193664385957548, 2.593686270445928, 0.07815888706991843], "isController": false}, {"data": ["2.3 Search by first/last name", 67, 0, 0.0, 240.74626865671647, 157, 636, 180.0, 509.2, 522.2, 636.0, 0.12826182258135535, 3.46095855791117, 0.11078958911229418], "isController": false}, {"data": ["2.5 Select td_ipv", 27, 0, 0.0, 247.70370370370367, 175, 551, 204.0, 545.2, 549.0, 551.0, 0.34693221972373917, 8.15123825489881, 0.2419039110183103], "isController": false}, {"data": ["4.0 Vaccination for flu", 41, 0, 0.0, 1437.3170731707312, 1331, 1647, 1435.0, 1514.8, 1575.3, 1647.0, 0.1371746701952899, 7.201434939057643, 0.8008139884288147], "isController": true}, {"data": ["4.0 Vaccination for hpv", 41, 0, 0.0, 1490.9756097560978, 1368, 1624, 1494.0, 1573.0, 1612.0, 1624.0, 0.13512444631934192, 6.958857489849189, 0.8006181376967544], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 119.65714285714286, 112, 143, 119.0, 123.0, 129.39999999999992, 143.0, 0.6027519933869495, 3.6324048351473297, 0.36318162101537876], "isController": false}, {"data": ["2.4 Patient attending session", 61, 0, 0.0, 394.327868852459, 346, 447, 392.0, 428.8, 441.9, 447.0, 0.11888497586245203, 3.2764588197547853, 0.17693428048278995], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 364.0, 364, 364, 364.0, 364.0, 364.0, 364.0, 2.7472527472527473, 17.22935267857143, 5.808400583791209], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 355.97142857142853, 332, 424, 354.0, 368.79999999999995, 406.3999999999999, 424.0, 0.5986487642179081, 3.0897057801676215, 0.32446295326263574], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 498.1142857142857, 470, 721, 484.0, 541.0, 605.7999999999994, 721.0, 0.552006939515811, 5.360504889204321, 0.8705968821465184], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 27, 0, 0.0, 1501.0000000000005, 1351, 1853, 1485.0, 1610.8, 1792.5999999999997, 1853.0, 0.3402646502835539, 19.14200338689351, 2.0181430174858224], "isController": true}, {"data": ["2.1 Open session", 70, 0, 0.0, 365.69999999999993, 180, 695, 247.5, 569.5, 609.8000000000001, 695.0, 0.13166556945358787, 2.264649631453964, 0.08351248765635287], "isController": false}, {"data": ["4.3 Vaccination confirm", 136, 0, 0.0, 725.6764705882355, 543, 1272, 631.0, 956.3, 974.7, 1230.5599999999995, 0.33963828522623407, 7.139732610551014, 0.7908984158433768], "isController": false}, {"data": ["4.1 Vaccination questions", 137, 0, 0.0, 437.4817518248176, 278, 604, 507.0, 537.4, 542.1, 588.0400000000002, 0.3053816267255734, 3.5488728673440044, 0.6000250038172703], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1405.971428571429, 1326, 1642, 1388.0, 1465.0, 1615.6, 1642.0, 0.5884726612415092, 27.195597410089785, 2.806738747562042], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 27, 0, 0.0, 1496.3703703703704, 1358, 1785, 1475.0, 1587.0, 1720.1999999999996, 1785.0, 0.36791758646063283, 19.443542215988064, 2.182847269063582], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 41, 0, 0.0, 336.1463414634147, 178, 638, 209.0, 536.6, 544.9, 638.0, 0.1356685980139441, 2.974181138673161, 0.1012214930494661], "isController": false}, {"data": ["2.5 Select flu", 54, 0, 0.0, 243.88888888888886, 170, 632, 201.0, 512.5, 530.0, 632.0, 0.11099760121850699, 2.354632164997934, 0.0770696235023032], "isController": false}, {"data": ["1.5 Open Sessions list", 36, 0, 0.0, 154.47222222222214, 134, 216, 152.0, 179.20000000000002, 189.64999999999995, 216.0, 0.06879695153063661, 0.7531385025961295, 0.04121583861095133], "isController": false}, {"data": ["4.2 Vaccination batch", 136, 0, 0.0, 315.1911764705882, 283, 629, 299.0, 323.6, 508.75, 595.3299999999996, 0.34320727195643286, 6.991135382808596, 0.5519302491154842], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 87.0, 87, 87, 87.0, 87.0, 87.0, 87.0, 11.494252873563218, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 70, 0, 0.0, 450.6714285714286, 157, 1322, 522.5, 903.6, 937.6, 1322.0, 0.13164922627869013, 10.28024344175274, 0.08465919482863032], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1066, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
