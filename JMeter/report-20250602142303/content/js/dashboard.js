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

    var data = {"OkPercent": 99.96056782334385, "KoPercent": 0.03943217665615142};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7193717277486911, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9916666666666667, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.8666666666666667, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.72, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.98, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.93, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1595744680851064, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.48, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9932432432432432, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9797297297297297, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9083333333333333, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.49166666666666664, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.19, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9431818181818182, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4596774193548387, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8026315789473685, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.979381443298969, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4787234042553192, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.6436170212765957, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.6808510638297872, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.08, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8686868686868687, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9625, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8986486486486487, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7338709677419355, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9838709677419355, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9112903225806451, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.495, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8666666666666667, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9866666666666667, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2536, 1, 0.03943217665615142, 496.43690851734954, 0, 3845, 351.0, 1091.3000000000002, 1335.6000000000004, 2207.300000000001, 4.229719113960575, 121.42772637117703, 3.9024158528154484], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 60, 0, 0.0, 163.75000000000003, 154, 224, 160.5, 172.9, 176.95, 224.0, 0.11831915804087138, 0.08585071721129632, 0.09451667116936796], "isController": false}, {"data": ["1.4 Select Organisations-1", 60, 0, 0.0, 201.63333333333327, 160, 1592, 177.0, 192.9, 224.7, 1592.0, 0.11831332523544352, 1.6138677020397219, 0.07648771611900743], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 4276.899999999999, 3177, 8214, 4053.0, 5485.2, 6001.899999999999, 8206.729999999996, 0.1954071503384452, 59.62330905643749, 0.8402736457307446], "isController": true}, {"data": ["1.3 Sign-in-1", 60, 0, 0.0, 177.66666666666669, 156, 625, 165.5, 181.6, 248.74999999999972, 625.0, 0.11836023727282231, 1.0645486184401305, 0.0781362503871366], "isController": false}, {"data": ["1.3 Sign-in-0", 60, 0, 0.0, 483.86666666666684, 383, 1342, 432.5, 648.3, 765.5999999999999, 1342.0, 0.11830795956233942, 0.08399402988459058, 0.10802533417069078], "isController": false}, {"data": ["1.4 Select Organisations", 60, 0, 0.0, 365.83333333333337, 320, 1749, 339.0, 358.7, 400.75, 1749.0, 0.11827600889435587, 1.6991780926219426, 0.1709457941051237], "isController": false}, {"data": ["2.4 Patient attending session-1", 100, 0, 0.0, 578.5999999999997, 322, 1309, 523.0, 823.8000000000002, 1084.6499999999996, 1307.279999999999, 0.19681668690598264, 23.07784441321073, 0.1314673963317306], "isController": false}, {"data": ["2.4 Patient attending session-0", 100, 0, 0.0, 298.36999999999995, 215, 1133, 278.5, 396.20000000000005, 471.74999999999994, 1130.929999999999, 0.19691357660036587, 0.14633909354773283, 0.16114607147569004], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 365.97000000000014, 248, 1581, 304.0, 642.4000000000002, 743.5499999999997, 1577.209999999998, 0.19747469361801284, 6.092861826710032, 0.17028721089704854], "isController": false}, {"data": ["1.2 Sign-in page", 60, 0, 0.0, 158.3, 150, 190, 156.0, 166.8, 173.85, 190.0, 0.11905068979953849, 0.7174431706571797, 0.07173269102179222], "isController": false}, {"data": ["3.0 Nurse triage", 94, 0, 0.0, 1617.3829787234042, 803, 4047, 1593.5, 2138.0, 2278.75, 4047.0, 0.20190477826989084, 22.671631143597256, 0.5922541560970948], "isController": true}, {"data": ["4.2 Vaccination batch-2", 74, 0, 0.0, 0.41891891891891914, 0, 5, 0.0, 1.0, 1.0, 5.0, 0.1828853877046648, 0.8609123995983936, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 100, 0, 0.0, 877.2299999999998, 546, 1796, 802.5, 1102.6, 1455.1999999999996, 1794.8599999999994, 0.1967307287496385, 23.213968551855267, 0.2924064151923338], "isController": false}, {"data": ["4.2 Vaccination batch-0", 74, 0, 0.0, 225.43243243243248, 161, 583, 179.5, 464.5, 476.5, 583.0, 0.18280316298878233, 0.13674533481387427, 0.1642372167477341], "isController": false}, {"data": ["4.2 Vaccination batch-1", 74, 0, 0.0, 247.67567567567573, 175, 2085, 206.0, 238.0, 326.25, 2085.0, 0.1827751692522767, 2.4863872828309894, 0.12559039158345045], "isController": false}, {"data": ["1.1 Homepage", 60, 0, 0.0, 509.5500000000001, 444, 2096, 468.5, 530.5, 734.7499999999991, 2096.0, 0.11866361041945608, 0.6124386533855717, 0.0643147497878888], "isController": false}, {"data": ["1.3 Sign-in", 60, 0, 0.0, 661.8166666666667, 544, 1506, 599.0, 819.5999999999999, 1046.4499999999994, 1506.0, 0.11826854845068202, 1.1476900058148702, 0.18606506987700072], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1723.6699999999998, 1041, 3603, 1612.5, 2529.8000000000006, 3084.549999999998, 3602.2099999999996, 0.19707734300326163, 3.3757193323019616, 0.12378920607392371], "isController": false}, {"data": ["3.3 Nurse triage complete", 88, 0, 0.0, 319.88636363636374, 209, 1116, 273.0, 590.7000000000006, 680.1, 1116.0, 0.19464504926952808, 4.517004138972141, 0.1315374747016733], "isController": false}, {"data": ["4.3 Vaccination confirm", 62, 0, 0.0, 1126.758064516129, 634, 3500, 1120.5, 1386.8, 1976.3499999999988, 3500.0, 0.17342463301109917, 4.206713749181827, 0.4034373566449606], "isController": false}, {"data": ["4.1 Vaccination questions", 76, 1, 1.3157894736842106, 560.5, 358, 2301, 403.0, 755.3999999999999, 1237.7499999999975, 2301.0, 0.16460834044470243, 1.8995401457541878, 0.329333013366847], "isController": false}, {"data": ["3.1 Nurse triage new", 97, 0, 0.0, 236.020618556701, 173, 1040, 198.0, 396.2000000000003, 497.59999999999997, 1040.0, 0.20008415911022367, 2.2530699446261933, 0.13755785938827877], "isController": false}, {"data": ["3.2 Nurse triage result", 94, 0, 0.0, 1080.159574468085, 562, 3562, 1122.5, 1327.0, 1479.5, 3562.0, 0.20292514436828754, 16.09257785093637, 0.3273563569269793], "isController": false}, {"data": ["1.0 Login", 60, 0, 0.0, 1939.8666666666666, 1673, 3545, 1783.5, 2479.5999999999995, 3465.2499999999964, 3545.0, 0.11831262533743747, 5.463640065387445, 0.56325590675782], "isController": true}, {"data": ["3.2 Nurse triage result-1", 94, 0, 0.0, 574.2978723404256, 246, 2954, 552.0, 651.0, 788.75, 2954.0, 0.203158904843827, 15.960532161513491, 0.13887604699778686], "isController": false}, {"data": ["3.2 Nurse triage result-0", 94, 0, 0.0, 505.6063829787235, 226, 1164, 533.5, 673.5, 745.25, 1164.0, 0.2030496326745741, 0.1505026085937517, 0.18875582957655512], "isController": false}, {"data": ["4.0 Vaccination", 75, 1, 1.3333333333333333, 1961.9733333333336, 480, 4541, 1917.0, 3090.4, 3532.600000000001, 4541.0, 0.16516876944862258, 8.323768312399109, 0.9063894299695429], "isController": true}, {"data": ["2.5 Patient return to consent page", 99, 0, 0.0, 391.050505050505, 208, 2116, 272.0, 734.0, 814.0, 2116.0, 0.19743454745608577, 4.459312513336803, 0.13689309442755945], "isController": false}, {"data": ["1.5 Open Sessions list", 120, 0, 0.0, 263.55833333333317, 168, 1887, 193.0, 479.9, 594.1499999999992, 1869.7799999999993, 0.21702213083179156, 2.3702885851784736, 0.13532092825790912], "isController": false}, {"data": ["4.2 Vaccination batch", 74, 0, 0.0, 474.0405405405405, 339, 2254, 384.0, 685.0, 804.0, 2254.0, 0.1827002604713173, 3.4820775519399554, 0.28968368474329376], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 62, 0, 0.0, 467.0161290322579, 238, 958, 534.0, 646.7, 747.1499999999994, 958.0, 0.1737653551119245, 0.13100278725234935, 0.1666601563047396], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 62, 0, 0.0, 215.95161290322577, 161, 2185, 179.0, 213.8, 235.0, 2185.0, 0.17394866269951492, 0.1299518818018837, 0.11738137297398905], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 62, 0, 0.0, 443.3387096774194, 214, 3001, 370.5, 623.6000000000004, 849.2999999999995, 3001.0, 0.17377996653334193, 3.9544933201573547, 0.12032226198451115], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 922.89, 474, 3845, 757.0, 1257.6000000000001, 1969.0499999999968, 3840.719999999998, 0.19744155236446131, 23.057534915687523, 0.12575330122275555], "isController": false}, {"data": ["4.1 Vaccination questions-0", 75, 0, 0.0, 353.1333333333333, 178, 1798, 213.0, 523.8000000000002, 829.0000000000007, 1798.0, 0.18211088367485193, 0.13587179211678407, 0.241251867395353], "isController": false}, {"data": ["4.1 Vaccination questions-1", 75, 0, 0.0, 208.2933333333333, 173, 975, 193.0, 222.2000000000001, 249.0000000000001, 975.0, 0.18212061241091268, 1.9828832235044862, 0.124866444884232], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.03943217665615142], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2536, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 76, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
