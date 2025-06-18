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

    var data = {"OkPercent": 99.85858036442752, "KoPercent": 0.14141963557247755};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5236007632200618, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9142857142857143, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.36886792452830186, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.38252569750367105, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.7895522388059701, 500, 1500, "5.9 Patient return to td_ipv vaccination page"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.014982876712328766, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.20928030303030304, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.6560232220609579, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6142857142857143, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.5037593984962406, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7813573883161512, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.3860262008733624, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6481751824817519, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.5497448979591837, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6418338108882522, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.8923728813559322, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4631849315068493, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.5813124108416547, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.7854137447405329, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0034071550255536627, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.7476280834914611, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.6120815138282387, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8769230769230769, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6309627059843885, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5293255131964809, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.3888888888888889, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.49076704545454547, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18385, 26, 0.14141963557247755, 740.3562686973067, 0, 9726, 606.0, 1367.4000000000015, 1588.0, 2253.1399999999994, 5.106104773881628, 139.39218189675475, 6.761342833084809], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 530, 0, 0.0, 5943.403773584905, 3697, 11814, 5819.5, 7076.1, 7663.15, 9468.699999999992, 0.15193429558387203, 43.25379001488884, 0.6607008641263061], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 606.0, 606, 606, 606.0, 606.0, 606.0, 606.0, 1.6501650165016502, 22.897651093234323, 1.0023463283828382], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 460.98571428571427, 417, 697, 441.0, 526.6, 570.95, 697.0, 0.07871819784806938, 1.1326503194272013, 0.11377239532728776], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 339.0, 339, 339, 339.0, 339.0, 339.0, 339.0, 2.949852507374631, 38.24149612831858, 1.7918049410029497], "isController": false}, {"data": ["2.3 Search by first/last name", 530, 0, 0.0, 1415.4094339622643, 958, 3998, 1325.0, 1871.5000000000005, 2187.4499999999994, 2882.389999999998, 0.15206393800840998, 13.291614567284132, 0.1311573880407738], "isController": false}, {"data": ["5.8 Consent confirm", 681, 0, 0.0, 1358.2892804698972, 885, 6016, 1245.0, 1746.200000000001, 2094.0999999999995, 2786.5199999999995, 0.20945429313635813, 16.875113632221943, 0.4648396482828746], "isController": false}, {"data": ["5.9 Patient return to td_ipv vaccination page", 670, 0, 0.0, 547.5985074626867, 342, 2400, 470.0, 786.5999999999999, 908.6999999999996, 1465.87, 0.21168808929066796, 4.9355154537834345, 0.1527762394298134], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 117.08571428571429, 106, 179, 113.0, 130.0, 140.45, 179.0, 0.07879759374662297, 0.47647919968661073, 0.04747862826334606], "isController": false}, {"data": ["3.0 Nurse triage", 1168, 0, 0.0, 2043.5616438356178, 1028, 6660, 1940.0, 2507.3, 2752.0, 4400.0, 0.3380990439149553, 33.79844466705566, 1.0167830543557896], "isController": true}, {"data": ["2.4 Patient attending session", 528, 0, 0.0, 1675.9507575757582, 1161, 6567, 1553.5, 2117.2, 2310.2, 3617.0000000000073, 0.1513648638576253, 11.367191587370924, 0.22497785428838446], "isController": false}, {"data": ["5.4 Consent route", 689, 0, 0.0, 604.1146589259804, 435, 5248, 534.0, 747.0, 859.5, 1604.9000000000028, 0.20907697522361982, 2.3825794955266937, 0.33497549035226587], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 348.9285714285714, 314, 701, 336.5, 392.6, 402.0, 701.0, 0.0788993762440741, 0.40882821323345425, 0.04276284552291125], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 560.4571428571429, 450, 1209, 544.0, 662.8, 681.5, 1209.0, 0.07874432056587918, 0.7657577580029541, 0.123883887140265], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 6563.0, 6563, 6563, 6563.0, 6563.0, 6563.0, 6563.0, 0.15236934328813043, 1514.4676477030323, 0.09537963774188633], "isController": false}, {"data": ["2.1 Open session", 532, 0, 0.0, 916.3928571428573, 385, 4033, 849.5, 1305.1999999999998, 1539.099999999999, 2252.999999999996, 0.15074916953359283, 2.499863033788783, 0.09834415266782108], "isController": false}, {"data": ["3.3 Nurse triage complete", 1164, 0, 0.0, 565.9089347079037, 340, 3306, 476.0, 817.5, 937.25, 1505.6999999999925, 0.33831416655694707, 8.194721017880223, 0.22928827556851458], "isController": false}, {"data": ["4.3 Vaccination confirm", 1145, 0, 0.0, 1359.3860262008727, 909, 9726, 1250.0, 1735.2000000000003, 2007.7, 3009.0199999999977, 0.3417896164016031, 8.809668465657904, 0.7956893053282762], "isController": false}, {"data": ["5.6 Consent questions", 685, 0, 0.0, 593.7065693430661, 432, 2515, 533.0, 756.0, 850.6999999999999, 1157.12, 0.20954375441839065, 2.520905108282882, 0.4161375137197626], "isController": false}, {"data": ["4.1 Vaccination questions", 1176, 21, 1.7857142857142858, 664.1862244897958, 114, 5537, 635.0, 828.3, 918.8999999999992, 1438.9100000000003, 0.3461314657931753, 3.9774834822297107, 0.7384022389606579], "isController": false}, {"data": ["5.3 Consent parent details", 698, 5, 0.7163323782234957, 600.7851002865327, 388, 4593, 534.0, 772.4000000000001, 854.5499999999995, 1507.1299999999999, 0.2110929017441173, 2.397687917479309, 0.35927187767740953], "isController": false}, {"data": ["3.1 Nurse triage new", 1180, 0, 0.0, 420.19406779661017, 303, 1994, 368.5, 578.0, 630.95, 931.6600000000008, 0.33972329825258424, 3.8209488963851137, 0.2342277880702421], "isController": false}, {"data": ["3.2 Nurse triage result", 1168, 0, 0.0, 1059.7457191780807, 567, 5697, 964.5, 1410.1000000000001, 1658.999999999999, 2902.819999999999, 0.33840692621628027, 21.854174836504257, 0.5558255784462313], "isController": false}, {"data": ["5.2 Consent who", 701, 0, 0.0, 652.6048502139789, 455, 3232, 572.0, 882.8000000000001, 974.3999999999999, 1318.8400000000001, 0.21149226650318506, 3.167900028212797, 0.33909579834106796], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1954.9142857142854, 1654, 9898, 1816.5, 2025.5, 2156.9500000000003, 9898.0, 0.07874945859747215, 14.916923935405757, 0.376976778401836], "isController": true}, {"data": ["5.0 Consent", 685, 5, 0.7299270072992701, 6437.039416058397, 1712, 12235, 6281.0, 7419.599999999999, 7852.299999999998, 10291.919999999998, 0.2098639744437762, 42.06358954060929, 3.1993796413256175], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 713, 0, 0.0, 554.6577840112202, 332, 5963, 470.0, 796.6, 882.8999999999999, 1451.480000000001, 0.2135131355496975, 4.851839128464385, 0.15428461186800635], "isController": false}, {"data": ["4.0 Vaccination", 1174, 21, 1.788756388415673, 2577.0792163543433, 113, 11048, 2488.0, 3105.0, 3545.75, 4695.0, 0.34221099785695464, 18.162782043968136, 2.050123629279532], "isController": true}, {"data": ["2.5 Patient return to consent page", 527, 0, 0.0, 578.7324478178376, 337, 2436, 493.0, 820.5999999999999, 913.3999999999995, 1593.640000000001, 0.15132055177158465, 3.3230035005619247, 0.10491952320100108], "isController": false}, {"data": ["5.5 Consent agree", 687, 0, 0.0, 614.2561863173228, 445, 2103, 542.0, 852.2, 977.8000000000001, 1316.64, 0.20945281595134108, 3.6408209690050994, 0.3316881107134963], "isController": false}, {"data": ["Debug Sampler", 1361, 0, 0.0, 0.24173401910360043, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.38796493435524987, 1.7231833759306099, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 195, 0, 0.0, 438.3384615384617, 310, 2914, 367.0, 585.6, 641.2, 2072.079999999993, 0.05597659202451258, 0.6552103828181717, 0.03531195620176145], "isController": false}, {"data": ["4.2 Vaccination batch", 1153, 0, 0.0, 597.6426712922818, 448, 5381, 534.0, 750.6000000000001, 868.7999999999997, 1517.380000000002, 0.3400870953317516, 5.694711275586909, 0.5495801837915611], "isController": false}, {"data": ["5.7 Consent triage", 682, 0, 0.0, 691.2785923753667, 464, 2591, 606.5, 937.0, 1051.9500000000003, 1617.0, 0.20919558775218114, 3.4160203321163998, 0.35537920036060167], "isController": false}, {"data": ["2.2 Session register", 531, 0, 0.0, 1365.2504708097927, 693, 4729, 1311.0, 1707.8, 1961.9999999999995, 2661.9999999999864, 0.150902816596809, 12.042352207156176, 0.09976874622920576], "isController": false}, {"data": ["5.1 Consent homepage", 704, 0, 0.0, 798.1036931818173, 583, 6197, 716.0, 994.0, 1142.5, 1716.8000000000002, 0.21153712671885183, 2.662772469077719, 0.4603092784908809], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 60.0, 60, 60, 60.0, 60.0, 60.0, 60.0, 16.666666666666668, 0.11393229166666667, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 26, 100.0, 0.14141963557247755], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18385, 26, "422/Unprocessable Entity", 26, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1176, 21, "422/Unprocessable Entity", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 698, 5, "422/Unprocessable Entity", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
