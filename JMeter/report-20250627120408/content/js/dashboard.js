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

    var data = {"OkPercent": 99.98154232345233, "KoPercent": 0.018457676547676178};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2798573440824767, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5555555555555556, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6487603305785123, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.5225903614457831, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.24389392882065597, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.513733468972533, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.15625, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5833333333333334, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.14924297043979812, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9917355371900827, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5537190082644629, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0159500693481276, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.13005842891149103, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.38271604938271603, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.4027479604980678, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3888888888888889, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.41975308641975306, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [0.5258493353028065, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5442028985507247, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.37037037037037035, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.3765432098765432, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.8409090909090909, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.41053763440860214, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.375, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.22164231036882392, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 27089, 5, 0.018457676547676178, 1856.1515744398005, 114, 24830, 1241.0, 4749.800000000003, 6620.750000000004, 11571.88000000002, 5.012448317048596, 138.73882687940213, 7.190145766103478], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 15, 0, 0.0, 13634.666666666664, 6167, 26810, 11988.0, 25436.600000000002, 26810.0, 26810.0, 0.0030725830140236783, 0.6884230263416637, 0.04913352294840559], "isController": true}, {"data": ["2.0 Register attendance", 1423, 0, 0.0, 12033.852424455374, 4324, 40392, 10446.0, 19763.2, 23596.399999999994, 31120.079999999998, 0.2677165620979195, 70.22013786691561, 1.1560316542616507], "isController": true}, {"data": ["2.5 Select patient", 1386, 0, 0.0, 1141.1385281385283, 407, 13233, 775.0, 1826.8999999999994, 3906.5499999999993, 7899.979999999947, 0.26145600814022346, 6.823157092675686, 0.18128297439410024], "isController": false}, {"data": ["1.4 Select Organisations", 121, 0, 0.0, 599.859504132231, 478, 1614, 521.0, 797.3999999999999, 1086.499999999999, 1601.46, 0.1351094833458021, 1.941407165966926, 0.1952754251482296], "isController": false}, {"data": ["2.5 Select menacwy", 996, 0, 0.0, 1165.444779116466, 408, 12832, 774.0, 1956.1000000000004, 4081.0499999999997, 6883.729999999992, 0.19663870224774224, 4.524945154386059, 0.1371094076219609], "isController": false}, {"data": ["2.3 Search by first/last name", 1433, 0, 0.0, 2072.669923237965, 760, 14692, 1521.0, 3709.600000000005, 5648.2999999999965, 10298.520000000002, 0.26874516263395765, 21.22620919470174, 0.23185669355259161], "isController": false}, {"data": ["2.5 Select td_ipv", 983, 0, 0.0, 1153.395727365208, 410, 13048, 790.0, 1976.8000000000006, 3732.7999999999993, 6948.759999999998, 0.19777167853229674, 4.620235207400222, 0.13770625663430427], "isController": false}, {"data": ["4.0 Vaccination for flu", 1366, 0, 0.0, 5674.3887262079115, 2170, 28672, 4169.5, 11072.8, 14100.599999999966, 19516.619999999948, 0.26097219977402786, 13.686835549865654, 1.5401323295981448], "isController": true}, {"data": ["5.8 Consent confirm", 80, 0, 0.0, 2550.525, 1093, 9784, 1899.0, 4840.500000000002, 6817.850000000001, 9784.0, 0.01570042644320773, 1.5559406255501282, 0.034622583459051226], "isController": false}, {"data": ["4.0 Vaccination for hpv", 1334, 0, 0.0, 5551.088455772114, 2325, 30764, 4107.0, 10557.5, 14292.25, 20356.450000000026, 0.2606303581615987, 13.364825888443761, 1.5389882116781548], "isController": true}, {"data": ["1.2 Sign-in page", 121, 0, 0.0, 122.5206611570248, 114, 153, 121.0, 131.0, 136.79999999999998, 151.9, 0.1356325858969013, 0.8173717652048612, 0.08172393115076963], "isController": false}, {"data": ["5.9 Patient home page", 78, 0, 0.0, 925.7307692307689, 425, 6556, 638.0, 1650.5000000000002, 2133.8499999999985, 6556.0, 0.015635959579841718, 0.3811173139110326, 0.011669806972074375], "isController": false}, {"data": ["2.4 Patient attending session", 1387, 0, 0.0, 2758.966834895455, 984, 24127, 1935.0, 5412.200000000002, 7444.599999999984, 12340.159999999993, 0.26077011600791977, 18.070883334150395, 0.38758995758208387], "isController": false}, {"data": ["5.4 Consent route", 81, 0, 0.0, 1118.6296296296298, 497, 7553, 727.0, 2116.5999999999995, 3516.9999999999995, 7553.0, 0.01581881094880447, 0.189964001036718, 0.025124263107056635], "isController": false}, {"data": ["1.1 Homepage", 121, 0, 0.0, 375.84297520661147, 332, 1034, 357.0, 408.0, 435.79999999999995, 936.9800000000005, 0.13558683888809828, 0.699781683128515, 0.07348700740517045], "isController": false}, {"data": ["1.3 Sign-in", 121, 0, 0.0, 597.6776859504132, 487, 1063, 546.0, 788.6, 878.3, 1060.3600000000001, 0.13497956342477735, 1.3098553923359495, 0.21235554363019168], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 971, 5, 0.5149330587023687, 5640.210092687955, 128, 27242, 4268.0, 10205.6, 13692.8, 19702.399999999987, 0.1974402311209725, 11.026484800482681, 1.1620660149724151], "isController": true}, {"data": ["2.1 Open session", 1442, 0, 0.0, 4079.2739251040202, 1174, 20267, 3493.0, 6711.200000000001, 8630.549999999997, 12709.709999999981, 0.26954928630190533, 4.71591737983747, 0.17651074506497688], "isController": false}, {"data": ["4.3 Vaccination confirm", 4621, 0, 0.0, 2885.5970569141027, 1024, 24830, 1907.0, 5850.800000000002, 8508.099999999993, 13979.019999999986, 0.8871448468902415, 18.677496935201084, 2.0647693445595903], "isController": false}, {"data": ["5.6 Consent questions", 81, 0, 0.0, 1464.0987654320988, 512, 7404, 919.0, 3789.199999999999, 4725.499999999999, 7404.0, 0.0158038326830674, 0.19405709523555417, 0.03945356407156678], "isController": false}, {"data": ["4.1 Vaccination questions", 4658, 5, 0.10734220695577501, 1447.8089308716221, 128, 21470, 873.0, 3038.2000000000007, 4936.150000000001, 9471.52999999998, 0.8871890886027248, 10.292689635953442, 1.7519768848482655], "isController": false}, {"data": ["5.3 Consent parent details", 81, 0, 0.0, 1674.1604938271605, 499, 19319, 801.0, 3713.2, 5396.099999999999, 19319.0, 0.015816973018001473, 0.17882081134334724, 0.029168836923786207], "isController": false}, {"data": ["5.2 Consent who", 81, 0, 0.0, 1288.6296296296293, 513, 12304, 703.0, 2072.2, 4653.499999999997, 12304.0, 0.015870111173067677, 0.3277469552163096, 0.02522123896243564], "isController": false}, {"data": ["1.0 Login", 121, 0, 0.0, 2208.7851239669426, 1801, 4660, 2066.0, 2684.6, 3112.2, 4449.9000000000015, 0.1352059544255367, 6.371448565238548, 0.6436806912348549], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 983, 0, 0.0, 5604.450661241101, 2454, 30445, 4249.0, 10472.800000000001, 13177.599999999997, 17901.03999999998, 0.19603377604128236, 10.334501193938927, 1.159805681332539], "isController": true}, {"data": ["5.0 Consent for td_ipv", 14, 0, 0.0, 12677.285714285712, 7468, 22269, 11218.0, 21087.0, 22269.0, 22269.0, 0.0031013219606380216, 0.700965609399243, 0.04973926812456859], "isController": true}, {"data": ["2.5 Select hpv", 1354, 0, 0.0, 1145.5147710487456, 412, 13432, 791.0, 1821.5, 3696.0, 7266.8000000000175, 0.26082566154653436, 5.671827169721801, 0.19434568335938057], "isController": false}, {"data": ["2.5 Select flu", 1380, 0, 0.0, 1087.9963768115947, 408, 11930, 766.0, 1719.0, 3479.9, 6798.2900000000045, 0.260595865665475, 5.476381030032541, 0.1806865865453977], "isController": false}, {"data": ["5.1 Consent start", 81, 0, 0.0, 1479.8271604938266, 685, 5129, 1030.0, 3350.4, 3731.199999999998, 5129.0, 0.015869834442360467, 0.2005196746272499, 0.03427558209964963], "isController": false}, {"data": ["5.5 Consent agree", 81, 0, 0.0, 1614.3333333333337, 505, 10228, 940.0, 3890.7999999999984, 6942.299999999999, 10228.0, 0.01580675018485116, 0.3165170992569266, 0.02481181826071888], "isController": false}, {"data": ["1.5 Open Sessions list", 154, 0, 0.0, 600.6493506493507, 365, 6484, 434.5, 762.5, 1221.0, 5628.749999999982, 0.029261483849846025, 0.3471372127030562, 0.017812846648828564], "isController": false}, {"data": ["4.2 Vaccination batch", 4650, 0, 0.0, 1307.8653763440877, 506, 13525, 805.0, 2609.300000000004, 4403.999999999996, 8351.909999999987, 0.8867743611219813, 18.08546660970333, 1.4351268639782528], "isController": false}, {"data": ["5.0 Consent for hpv", 20, 0, 0.0, 13646.849999999999, 6563, 28288, 10883.5, 22517.6, 28000.049999999996, 28288.0, 0.0040917944994415725, 0.9109175691247303, 0.06550107872489863], "isController": true}, {"data": ["5.7 Consent triage", 80, 0, 0.0, 1763.9499999999998, 539, 13968, 983.5, 3508.100000000001, 6746.450000000001, 13968.0, 0.015703785770524895, 0.26878547583354223, 0.026427677171583293], "isController": false}, {"data": ["5.0 Consent for flu", 31, 0, 0.0, 14005.612903225809, 7312, 27564, 11494.0, 25454.0, 26943.0, 27564.0, 0.006347351219623062, 1.5025998321893428, 0.09918316148306476], "isController": true}, {"data": ["2.2 Session register", 1437, 0, 0.0, 2156.442588726514, 754, 14493, 1616.0, 3868.0, 5549.499999999996, 9217.819999999978, 0.2691111018723166, 19.497134517464318, 0.17858497345734917], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 5, 100.0, 0.018457676547676178], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 27089, 5, "422/Unprocessable Entity", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 4658, 5, "422/Unprocessable Entity", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
