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

    var data = {"OkPercent": 99.963113242346, "KoPercent": 0.03688675765400221};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5334363691194209, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4139030612244898, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.48774355751099935, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.003392967304133251, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8770846201358864, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8048705302096177, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6126760563380281, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.47761194029850745, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.48833640270104356, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4984256926952141, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.518937080024435, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5748007357449417, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7258163894023414, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5362630608481869, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21688, 8, 0.03688675765400221, 680.9979712283284, 0, 3474, 635.0, 1286.0, 1386.0, 1712.0, 6.023059140842051, 2028.699134062447, 21.554977251065587], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1568, 0, 0.0, 1346.0420918367347, 950, 3474, 1290.5, 1651.0, 1882.1, 2358.0999999999995, 0.4523833360212828, 177.01203441463673, 2.3465638719541664], "isController": false}, {"data": ["4.1 Vaccination questions", 1591, 0, 0.0, 1233.5015713387825, 487, 2298, 1240.0, 1331.8, 1423.0, 1658.119999999999, 0.4534227145115503, 173.48666333881775, 2.253770423348192], "isController": false}, {"data": ["Get Next Patient from STS", 1629, 0, 0.0, 0.6396562308164521, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.45427457314503855, 0.19116397000979102, 0.28999350448711175], "isController": false}, {"data": ["2.0 Register attendance", 1621, 8, 0.4935225169648365, 2587.783466995676, 1390, 4937, 2513.0, 3512.0, 3789.5999999999995, 4423.639999999999, 0.45367073076531256, 791.703638961045, 7.6352258355265885], "isController": true}, {"data": ["1.0 Login", 1631, 0, 0.0, 3195.0196198651142, 1822, 5119, 3239.0, 3655.6, 3781.5999999999995, 4227.72, 0.45406774824435026, 733.7102167635841, 7.547761905445473], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 382, 0, 0.0, 3386.740837696334, 1616, 5234, 3318.0, 3849.7, 4137.7, 4658.5700000000015, 0.10984669197549786, 126.98802439664117, 1.602781426254337], "isController": true}, {"data": ["2.5 Select patient", 1619, 0, 0.0, 442.2958616429904, 308, 1737, 428.0, 557.0, 626.0, 943.3999999999996, 0.45624191924828017, 179.861893669742, 1.62165764574379], "isController": false}, {"data": ["2.3 Search by first/last name", 1622, 0, 0.0, 465.755856966708, 308, 1265, 437.0, 617.0, 660.5499999999997, 865.3299999999995, 0.4539424707680079, 179.36203100380547, 1.678504410686399], "isController": false}, {"data": ["4.0 Vaccination for flu", 424, 0, 0.0, 3350.917452830189, 1831, 5085, 3330.5, 3735.5, 3992.75, 4474.75, 0.12133234359717204, 139.80477847913698, 1.7628473719600382], "isController": true}, {"data": ["4.0 Vaccination for hpv", 400, 0, 0.0, 3354.7124999999987, 2094, 6067, 3329.0, 3749.2000000000007, 3947.8999999999996, 4479.860000000001, 0.11512560491310031, 132.81746338637004, 1.6807067888274054], "isController": true}, {"data": ["1.2 Sign-in page", 1633, 0, 0.0, 702.1769748928357, 202, 2637, 613.0, 1227.2000000000003, 1305.0, 1429.9800000000002, 0.4545264769327117, 177.2149973253427, 1.9422268587780949], "isController": false}, {"data": ["2.4 Patient attending session", 670, 8, 1.1940298507462686, 943.3656716417917, 437, 2602, 899.0, 1183.1, 1337.3999999999992, 1750.2999999999975, 0.18862904690247173, 74.75514323182439, 0.8245586880920172], "isController": false}, {"data": ["Debug Sampler", 1621, 0, 0.0, 0.6033312769895129, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.4556123657861815, 3.027750832999798, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1629, 0, 0.0, 966.8753836709624, 447, 2655, 848.0, 1454.0, 1542.5, 1784.6000000000004, 0.45419984291209853, 202.93773176582107, 1.613971876117899], "isController": false}, {"data": ["4.2 Vaccination batch", 1588, 0, 0.0, 801.7229219143564, 483, 2166, 789.0, 941.2000000000003, 1069.0, 1379.5399999999986, 0.45354206931139573, 174.73657775956286, 2.0306033928474014], "isController": false}, {"data": ["1.1 Homepage", 1637, 0, 0.0, 696.7306047648137, 469, 1823, 687.0, 871.0, 968.1999999999998, 1295.4799999999996, 0.4548141957595869, 177.1315008067951, 1.935118157661466], "isController": false}, {"data": ["1.3 Sign-in", 1631, 0, 0.0, 832.6640098099327, 412, 2381, 725.0, 1290.8, 1333.3999999999999, 1483.7200000000003, 0.45421999899185994, 177.26178406609958, 2.0648143227805393], "isController": false}, {"data": ["2.2 Session register", 1623, 0, 0.0, 511.467036352434, 300, 1480, 508.0, 675.0, 730.0, 1003.5999999999999, 0.453621594064852, 180.6446189854612, 1.620773170564095], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 382, 0, 0.0, 3366.814136125653, 1768, 5095, 3341.0, 3737.2999999999997, 3970.7499999999986, 4822.100000000002, 0.11063853204100577, 127.81712083765967, 1.6111583494077797], "isController": true}, {"data": ["2.1 Open session", 1627, 0, 0.0, 778.8666256914568, 365, 2563, 714.0, 1184.4, 1318.1999999999998, 1638.72, 0.4544913635467199, 175.95296121978066, 1.6198887660671217], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.03688675765400221], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21688, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 670, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
