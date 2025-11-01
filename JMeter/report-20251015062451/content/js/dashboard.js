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

    var data = {"OkPercent": 99.99536650912798, "KoPercent": 0.004633490872022982};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5286094224924012, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3587736464448793, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4672867222578576, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.904113924050633, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8649244332493703, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5913642052565707, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.46663346613545814, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.47589229805886035, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4922829581993569, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4959425717852684, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5488415779586725, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.784098051539912, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.496551724137931, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21582, 1, 0.004633490872022982, 712.9653414882756, 0, 8048, 648.0, 1305.0, 1464.0, 2018.9800000000032, 5.993053922212481, 2026.0374944826945, 21.52278619239683], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1533, 0, 0.0, 1448.4494455316353, 994, 4704, 1339.0, 1915.8000000000004, 2207.3, 2940.180000000002, 0.44344923084844595, 173.5328712798934, 2.3001957075893458], "isController": false}, {"data": ["4.1 Vaccination questions", 1559, 0, 0.0, 1251.119948685054, 507, 3720, 1202.0, 1387.0, 1584.0, 2113.600000000001, 0.4451406290331055, 170.3276789090928, 2.2127614607829393], "isController": false}, {"data": ["Get Next Patient from STS", 1597, 0, 0.0, 0.6462116468378202, 0, 11, 1.0, 1.0, 1.0, 1.0, 0.44544411363873454, 0.18765642929683424, 0.28438339958163955], "isController": false}, {"data": ["2.0 Register attendance", 1586, 1, 0.06305170239596469, 2975.284993694832, 1543, 11642, 2937.0, 3765.8999999999996, 4074.199999999999, 4851.679999999996, 0.44420021834709345, 815.1356905107798, 7.898717669887678], "isController": true}, {"data": ["1.0 Login", 1597, 0, 0.0, 3248.2855353788377, 2044, 11448, 3219.0, 3733.4, 3974.0, 4855.159999999998, 0.44516920332274074, 719.6215671952529, 7.401322924506606], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 388, 0, 0.0, 3518.822164948454, 1777, 10062, 3382.0, 4105.900000000001, 4487.699999999999, 5171.160000000001, 0.11112514495673709, 128.47900392373077, 1.6215457496923293], "isController": true}, {"data": ["2.5 Select patient", 1580, 0, 0.0, 461.34620253164627, 319, 7783, 437.0, 566.0, 699.0, 1141.0900000000006, 0.4456617089152086, 175.67903031204781, 1.5840776490604436], "isController": false}, {"data": ["2.3 Search by first/last name", 1588, 0, 0.0, 471.5774559193953, 320, 8048, 438.0, 610.1000000000001, 652.55, 982.0899999999981, 0.4447368281022144, 175.793043739608, 1.644555787060959], "isController": false}, {"data": ["4.0 Vaccination for flu", 390, 0, 0.0, 3501.2230769230787, 1799, 6358, 3370.5, 4085.4, 4405.049999999999, 5219.349999999997, 0.11197632763010142, 129.29896064882675, 1.63044049280064], "isController": true}, {"data": ["4.0 Vaccination for hpv", 388, 0, 0.0, 3479.092783505156, 1748, 10168, 3352.0, 4044.4000000000005, 4231.649999999999, 5555.1100000000015, 0.11156500688798902, 128.25158761111214, 1.6225976053635165], "isController": true}, {"data": ["1.2 Sign-in page", 1598, 0, 0.0, 712.9687108886101, 199, 6900, 576.0, 1209.0, 1249.1, 1488.4899999999996, 0.4446275882236571, 173.36709537863462, 1.899624113353324], "isController": false}, {"data": ["2.4 Patient attending session", 1004, 1, 0.099601593625498, 1012.890438247011, 428, 7739, 920.0, 1340.5, 1577.0, 2258.3000000000025, 0.2822737431157117, 111.84594818876339, 1.2361243890629046], "isController": false}, {"data": ["Debug Sampler", 1586, 0, 0.0, 0.5353089533417418, 0, 6, 1.0, 1.0, 1.0, 1.0, 0.446050777228011, 2.91768140684373, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1597, 0, 0.0, 980.0281778334371, 452, 2829, 837.0, 1455.2, 1595.2999999999997, 2029.3199999999988, 0.4453669703918811, 199.00422803186285, 1.582564945892933], "isController": false}, {"data": ["4.2 Vaccination batch", 1555, 0, 0.0, 831.4051446945332, 508, 7894, 798.0, 994.4000000000001, 1227.3999999999996, 1704.7600000000016, 0.44562692400499104, 171.68684413988774, 1.9951440434403145], "isController": false}, {"data": ["1.1 Homepage", 1602, 0, 0.0, 711.5312109862671, 499, 2708, 662.5, 873.0, 991.5499999999997, 1490.4600000000005, 0.44503498469463015, 173.33298570762645, 1.8931012927544026], "isController": false}, {"data": ["1.3 Sign-in", 1597, 0, 0.0, 844.4051346274266, 422, 4328, 736.0, 1248.0, 1322.6999999999994, 1711.6399999999994, 0.44525471943515943, 173.77507952489412, 2.0243119867512327], "isController": false}, {"data": ["2.2 Session register", 1591, 0, 0.0, 508.7718416090501, 314, 2649, 454.0, 653.8, 773.0, 1067.199999999999, 0.44487033190234776, 178.9088212730995, 1.5884721957265886], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 3543.5089974293082, 1809, 10179, 3406.0, 4179.0, 4538.0, 5236.000000000001, 0.11244805781391147, 129.8043148712737, 1.636175191960253], "isController": true}, {"data": ["2.1 Open session", 1595, 0, 0.0, 893.119749216302, 368, 7642, 776.0, 1367.8000000000002, 1614.1999999999998, 2235.119999999999, 0.4453764617841865, 172.40934649643, 1.5863700492008355], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.004633490872022982], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21582, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1004, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
