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

    var data = {"OkPercent": 99.48016125610015, "KoPercent": 0.5198387438998515};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.33347105640847213, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03352984524686809, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.09579955784819455, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5431098010316876, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5501105379513633, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.39558514365802383, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1991869918699187, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [7.00770847932726E-4, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4053058216654385, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.42361597757533287, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.36334968465311845, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5386882829771555, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.061532792925571116, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18852, 98, 0.5198387438998515, 1303.135900700176, 0, 15496, 1146.0, 2484.0, 2971.699999999997, 4874.470000000001, 5.51656652551412, 1917.876026738829, 19.812947572225703], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1357, 36, 2.6529108327192334, 2437.836403831983, 253, 13041, 2291.0, 3372.4, 3882.2999999999997, 6267.640000000003, 0.4178902608472856, 168.1337792537618, 2.1512993443287947], "isController": false}, {"data": ["4.1 Vaccination questions", 1357, 0, 0.0, 1878.0766396462784, 748, 6804, 1835.0, 2240.4, 2462.299999999998, 4606.160000000022, 0.4162493692610424, 164.00082831218472, 2.0690235830228847], "isController": false}, {"data": ["Get Next Patient from STS", 1427, 0, 0.0, 0.6727400140154162, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.4194983540495555, 0.1741595913065948, 0.2678187378148516], "isController": false}, {"data": ["2.0 Register attendance", 1357, 26, 1.915991156963891, 6079.297715549007, 2665, 20428, 5767.0, 8302.2, 9973.3, 14780.500000000005, 0.4157016995674497, 785.8367642078002, 7.39612698775564], "isController": true}, {"data": ["1.0 Login", 1427, 0, 0.0, 6079.735108619473, 3675, 17249, 5985.0, 7149.4, 7763.599999999993, 11000.160000000002, 0.4192916468700481, 696.4022540396855, 6.9680691400209325], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 339, 9, 2.6548672566371683, 5571.722713864307, 3132, 15306, 5504.0, 6771.0, 7820.0, 12298.000000000042, 0.1044721153446116, 124.71506868935647, 1.5257534646836481], "isController": true}, {"data": ["2.5 Select patient", 1357, 0, 0.0, 756.4480471628586, 332, 5257, 697.0, 1078.6000000000001, 1329.2999999999988, 1875.6200000000008, 0.4164422573809557, 169.13162495291243, 1.4802207909257326], "isController": false}, {"data": ["2.3 Search by first/last name", 1357, 0, 0.0, 723.0058953574054, 335, 4613, 695.0, 920.2, 1059.1, 1749.8200000000088, 0.4162871663605611, 169.28730196018108, 1.5392326783738357], "isController": false}, {"data": ["4.0 Vaccination for flu", 339, 9, 2.6548672566371683, 5548.42477876106, 3341, 14832, 5487.0, 6783.0, 7475.0, 12117.200000000013, 0.10403978186632637, 124.05232195444253, 1.5161780566059275], "isController": true}, {"data": ["4.0 Vaccination for hpv", 339, 9, 2.6548672566371683, 5658.646017699117, 3414, 16136, 5497.0, 6969.0, 7738.0, 11427.600000000002, 0.10443146769648211, 124.30451613583622, 1.5243794577835021], "isController": true}, {"data": ["1.2 Sign-in page", 1427, 0, 0.0, 1159.287316047654, 250, 6159, 988.0, 1751.2, 2017.7999999999997, 3567.1600000000008, 0.419576430683592, 168.26586823377875, 1.790539018255838], "isController": false}, {"data": ["2.4 Patient attending session", 861, 26, 3.0197444831591174, 1728.3310104529621, 382, 7409, 1570.0, 2433.0, 2886.8999999999996, 4385.2199999999975, 0.26432724265240876, 107.64404726645414, 1.1520008690602352], "isController": false}, {"data": ["Debug Sampler", 1357, 0, 0.0, 0.46278555637435514, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.4167772339505445, 2.5944590367025024, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1427, 0, 0.0, 2436.240364400844, 1483, 6272, 2300.0, 3054.6000000000004, 3313.7999999999993, 4535.800000000003, 0.41922377501167774, 191.92220048736235, 1.4895545329672348], "isController": false}, {"data": ["4.2 Vaccination batch", 1357, 36, 2.6529108327192334, 1315.1031687546051, 559, 8244, 1283.0, 1654.6000000000001, 1929.099999999999, 3774.800000000014, 0.4166926395866606, 165.21220593728668, 1.8649839008518707], "isController": false}, {"data": ["1.1 Homepage", 1427, 0, 0.0, 1209.758934828309, 515, 6490, 1153.0, 1630.0, 1857.3999999999992, 3021.2000000000016, 0.4197502030361441, 168.15522907648557, 1.7828939051946955], "isController": false}, {"data": ["1.3 Sign-in", 1427, 0, 0.0, 1274.4477925718302, 462, 7272, 1188.0, 1768.6000000000001, 1973.1999999999998, 3158.5200000000077, 0.41947319810246436, 168.39867868055396, 1.9088297179123581], "isController": false}, {"data": ["2.2 Session register", 1357, 0, 0.0, 752.4937361827562, 334, 4455, 707.0, 987.0, 1136.2999999999997, 1712.3600000000042, 0.41614546261912816, 171.00529375332925, 1.4866902427803976], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 340, 9, 2.6470588235294117, 5744.935294117647, 3353, 16565, 5590.0, 7204.400000000001, 8128.799999999999, 12931.429999999971, 0.10620877771814814, 126.90466724516608, 1.5509498564346276], "isController": true}, {"data": ["2.1 Open session", 1357, 0, 0.0, 2749.6050110537963, 832, 15496, 2252.0, 4499.6, 6053.1, 10628.980000000005, 0.4160899563795452, 167.11493536663826, 1.4828349046963893], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 36, 36.734693877551024, 0.19096117122851686], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 36, 36.734693877551024, 0.19096117122851686], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 26, 26.53061224489796, 0.13791640144281775], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18852, 98, "Test failed: text expected to contain /Check and confirm/", 36, "Test failed: text expected to contain /Vaccination outcome recorded for/", 36, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 26, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.3 Vaccination confirm", 1357, 36, "Test failed: text expected to contain /Vaccination outcome recorded for/", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 861, 26, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 26, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1357, 36, "Test failed: text expected to contain /Check and confirm/", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
