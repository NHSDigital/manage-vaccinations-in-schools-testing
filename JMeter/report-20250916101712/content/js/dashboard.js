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

    var data = {"OkPercent": 91.53318077803203, "KoPercent": 8.466819221967963};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4089156626506024, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.2604166666666667, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.2, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9137931034482759, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.8181818181818182, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9310344827586207, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.1206896551724138, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3055555555555556, 500, 1500, "2.5 Select activity"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.1590909090909091, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7954545454545454, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.2840909090909091, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.7954545454545454, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.8636363636363636, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for activity"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.375, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.7727272727272727, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.8636363636363636, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.15517241379310345, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.3068181818181818, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.8181818181818182, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.0, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1748, 148, 8.466819221967963, 7438.192791762031, 0, 51699, 899.5, 27000.2, 33380.299999999996, 42398.07, 1.677407963273594, 40.93947707040651, 1.1488416031001338], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 2, 2, 100.0, 22409.5, 7635, 37184, 22409.5, 37184.0, 37184.0, 37184.0, 0.012054510496465014, 2.0846121630764314, 0.17928729966910367], "isController": true}, {"data": ["2.0 Register attendance", 199, 126, 63.31658291457286, 60541.01507537686, 22057, 108797, 56834.0, 84171.0, 93792.0, 106775.0, 0.2506363518430588, 42.88589865687568, 0.5800504189185104], "isController": true}, {"data": ["2.5 Select patient", 48, 0, 0.0, 1480.9166666666663, 565, 7467, 1376.5, 2499.7000000000007, 4596.199999999991, 7467.0, 0.0652940408305402, 1.4565943197925282, 0.0454422719061507], "isController": false}, {"data": ["Choose session", 199, 0, 0.0, 0.7437185929648241, 0, 40, 1.0, 1.0, 1.0, 2.0, 0.2698897927409139, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 20, 0, 0.0, 1606.0, 579, 4195, 1625.5, 2054.6, 4088.0499999999984, 4195.0, 0.033363582981903596, 0.7584871742046122, 0.025022687236427695], "isController": false}, {"data": ["2.3 Search by first/last name", 111, 31, 27.92792792792793, 26065.729729729745, 11641, 49706, 25267.0, 37495.2, 39838.2, 48688.399999999965, 0.14654413288780396, 11.450897999507559, 0.11459332435365456], "isController": false}, {"data": ["4.0 Vaccination for flu", 7, 0, 0.0, 3629.428571428571, 2906, 6368, 3061.0, 6368.0, 6368.0, 6368.0, 0.009544508771403561, 0.43820719909913475, 0.05669315708148011], "isController": true}, {"data": ["4.0 Vaccination for hpv", 19, 0, 0.0, 4708.263157894737, 2885, 10428, 3507.0, 7807.0, 10428.0, 10428.0, 0.028101894511404192, 1.220921587764435, 0.1681592755294619], "isController": true}, {"data": ["5.8 Consent confirm", 22, 22, 100.0, 1073.0454545454543, 101, 9624, 115.0, 3495.999999999999, 8765.099999999988, 9624.0, 0.0373129265545922, 0.6701370470931535, 0.03725661265620548], "isController": false}, {"data": ["1.2 Sign-in page", 58, 0, 0.0, 428.60344827586204, 103, 5491, 117.0, 1142.0000000000002, 4289.3499999999985, 5491.0, 0.07801592062821647, 0.4626862167726159, 0.04700763967539997], "isController": false}, {"data": ["Get correct patient name", 80, 0, 0.0, 1.1125, 0, 42, 1.0, 1.0, 1.0, 42.0, 0.10854286629147017, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 55, 7, 12.727272727272727, 24862.181818181816, 12872, 51699, 24067.0, 33921.6, 35638.79999999999, 51699.0, 0.07224436986490303, 7.096023645253874, 0.10751994108800021], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 114.0, 114, 114, 114.0, 114.0, 114.0, 114.0, 8.771929824561402, 41.77802905701754, 6.407620614035087], "isController": false}, {"data": ["5.4 Consent route", 22, 0, 0.0, 1153.9999999999995, 102, 10204, 109.5, 7092.999999999995, 10043.799999999997, 10204.0, 0.03699779694936347, 0.21905034433176934, 0.03443908922355078], "isController": false}, {"data": ["1.1 Homepage", 58, 0, 0.0, 594.0172413793105, 300, 10234, 355.5, 562.4000000000001, 1511.5999999999985, 10234.0, 0.07805571293800358, 0.43105962564883815, 0.042305586602140614], "isController": false}, {"data": ["1.3 Sign-in", 58, 0, 0.0, 3804.0517241379316, 1015, 21539, 1972.5, 11047.300000000001, 13198.799999999983, 21539.0, 0.07898012152044903, 1.1713585014951755, 0.1746972414490401], "isController": false}, {"data": ["2.5 Select activity", 18, 0, 0.0, 3176.5555555555557, 598, 17309, 1117.0, 10433.000000000011, 17309.0, 17309.0, 0.030040454478697978, 0.4796253877096156, 0.0210048490300271], "isController": false}, {"data": ["2.1 Open session", 199, 0, 0.0, 13505.61306532663, 6159, 22067, 13846.0, 17661.0, 18954.0, 21971.0, 0.2678821426263758, 4.427351334665564, 0.17280301727503283], "isController": false}, {"data": ["4.3 Vaccination confirm", 44, 0, 0.0, 2784.6590909090914, 1305, 14279, 1782.0, 4332.0, 11583.5, 14279.0, 0.05947891067078693, 1.1536527190310886, 0.13848489979155346], "isController": false}, {"data": ["5.6 Consent questions", 22, 0, 0.0, 786.4999999999999, 106, 5305, 121.0, 4027.1999999999975, 5270.2, 5305.0, 0.03728560775540641, 0.22350179648837368, 0.0685401095688428], "isController": false}, {"data": ["4.1 Vaccination questions", 44, 0, 0.0, 1841.6136363636367, 698, 14183, 945.0, 3162.0, 4992.75, 14183.0, 0.059506904153311425, 0.7088052044873616, 0.12336033754953274], "isController": false}, {"data": ["5.3 Consent parent details", 22, 0, 0.0, 1125.4090909090908, 103, 11738, 118.5, 4328.7, 10659.949999999984, 11738.0, 0.03687006653371097, 0.21505029307513113, 0.043701372362533304], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 22, 0, 0.0, 772.909090909091, 101, 11826, 110.5, 1402.3999999999996, 10295.849999999979, 11826.0, 0.03660967760186643, 0.23811241126313373, 0.03434757394322838], "isController": false}, {"data": ["1.0 Login", 58, 0, 0.0, 6786.568965517241, 2216, 23967, 4484.0, 12857.400000000001, 16570.649999999983, 23967.0, 0.0778202807702061, 3.829228991375366, 0.30770929378766065], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 18, 0, 0.0, 9150.166666666668, 3130, 23695, 7148.0, 23611.3, 23695.0, 23695.0, 0.02993957196391949, 1.422756658020229, 0.17930282068192366], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 912.0, 912, 912, 912.0, 912.0, 912.0, 912.0, 1.0964912280701753, 28.519479851973685, 0.7142184073464912], "isController": true}, {"data": ["5.0 Consent for activity", 18, 18, 100.0, 5009.777777777777, 1036, 20491, 1163.0, 16590.400000000005, 20491.0, 20491.0, 0.030109145652992098, 1.1472054949190815, 0.22558989879981597], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 793.0, 793, 793, 793.0, 793.0, 793.0, 793.0, 1.2610340479192939, 22.479409678436316, 0.8213962011349306], "isController": false}, {"data": ["2.5 Select hpv", 20, 0, 0.0, 1086.8500000000001, 571, 2750, 776.5, 2439.300000000001, 2737.45, 2750.0, 0.029677113010446347, 0.6511952689117403, 0.022141908535137703], "isController": false}, {"data": ["2.5 Select flu", 8, 0, 0.0, 661.5, 566, 806, 630.0, 806.0, 806.0, 806.0, 0.010940919037199124, 0.24242576415481398, 0.008162951312910284], "isController": false}, {"data": ["5.1 Consent start", 22, 0, 0.0, 1307.0454545454545, 104, 13450, 125.0, 5565.699999999997, 12459.549999999985, 13450.0, 0.03677914956575527, 0.22309767162906557, 0.03721668561350129], "isController": false}, {"data": ["5.5 Consent agree", 22, 0, 0.0, 660.0, 102, 8696, 121.5, 1330.3999999999994, 7630.849999999985, 8696.0, 0.03718835733954491, 0.25526056783240897, 0.03377788387259269], "isController": false}, {"data": ["Debug Sampler", 248, 0, 0.0, 1.3991935483870968, 0, 9, 1.0, 3.0, 4.0, 5.509999999999991, 0.27779893629891167, 3.8441545779556465, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 58, 0, 0.0, 1959.896551724138, 765, 9193, 1740.0, 2657.4, 4653.299999999995, 9193.0, 0.07857981880577643, 1.8011967841886567, 0.04696371983313982], "isController": false}, {"data": ["4.2 Vaccination batch", 44, 0, 0.0, 1727.4999999999993, 676, 13770, 991.0, 3666.5, 5216.5, 13770.0, 0.059681166929580295, 0.847361039099981, 0.09415122656666454], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 1, 100.0, 21154.0, 21154, 21154, 21154.0, 21154.0, 21154.0, 21154.0, 0.047272383473574736, 7.694826850122908, 0.703315197480382], "isController": true}, {"data": ["5.7 Consent triage", 22, 0, 0.0, 563.3636363636364, 101, 4701, 224.5, 1403.5999999999995, 4232.399999999993, 4701.0, 0.03723795902131873, 0.25191327205291175, 0.038127253319679415], "isController": false}, {"data": ["5.0 Consent for flu", 1, 1, 100.0, 7603.0, 7603, 7603, 7603.0, 7603.0, 7603.0, 7603.0, 0.13152702880441933, 22.027180882546364, 1.9578774414704723], "isController": true}, {"data": ["2.2 Session register", 199, 88, 44.221105527638194, 25264.79396984924, 3878, 47098, 28628.0, 41265.0, 43688.0, 47085.0, 0.2689432691878859, 17.83434937056801, 0.17585127851102736], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 115.0, 115, 115, 115.0, 115.0, 115.0, 115.0, 8.695652173913043, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 126, 85.13513513513513, 7.2082379862700225], "isController": false}, {"data": ["Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 22, 14.864864864864865, 1.2585812356979404], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1748, 148, "502/Bad Gateway", 126, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 22, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 111, 31, "502/Bad Gateway", 31, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.8 Consent confirm", 22, 22, "Test failed: text expected to contain /&lt;p class=&quot;govuk-notification-banner__heading&quot;&gt;Consent recorded for/", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 55, 7, "502/Bad Gateway", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 199, 88, "502/Bad Gateway", 88, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
