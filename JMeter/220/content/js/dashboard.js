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

    var data = {"OkPercent": 99.85844287158746, "KoPercent": 0.14155712841253792};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7101449275362319, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9827586206896551, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.14852700490998363, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9590834697217676, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9582651391162029, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.20270270270270271, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.22077922077922077, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9285173978819969, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.3732227488151659, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9254916792738276, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9073373676248109, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.20257234726688103, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7369067103109657, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.33797054009819966, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9333060556464812, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.37821482602118, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.22312703583061888, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.3333333333333333, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.1896551724137931, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8719040247678018, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9463993453355155, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.955810147299509, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9482758620689655, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14835, 21, 0.14155712841253792, 499.7201887428362, 2, 19125, 209.0, 1212.0, 1651.0, 3470.7999999999884, 4.018469519766482, 1646.014538823061, 19.398588742827158], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 29, 0, 0.0, 143.93103448275858, 62, 849, 77.0, 283.0, 615.0, 849.0, 0.008385884878572386, 3.38941562527471, 0.03672806348302812], "isController": false}, {"data": ["2.0 Register attendance", 1222, 21, 1.718494271685761, 2211.2070376432093, 511, 20013, 1857.5, 3724.9000000000005, 4689.799999999999, 9248.86, 0.4327949486950276, 828.4139983870464, 8.792027284852743], "isController": true}, {"data": ["2.5 Select patient", 1222, 0, 0.0, 214.936170212766, 59, 11470, 109.0, 388.10000000000014, 704.8999999999969, 1531.4199999999992, 0.43256223745826144, 175.86813039198387, 1.7974534375025442], "isController": false}, {"data": ["2.3 Search by first/last name", 1222, 0, 0.0, 197.1587561374795, 59, 7431, 101.0, 366.10000000000014, 609.0, 1681.6499999999992, 0.43288187744625195, 175.93644538731948, 1.8696307935146361], "isController": false}, {"data": ["4.0 Vaccination for flu", 296, 0, 0.0, 2075.5777027027016, 925, 19561, 1682.0, 3320.0, 4174.4, 7607.059999999961, 0.10974616379689099, 131.15905121231972, 1.8560358669511294], "isController": true}, {"data": ["4.0 Vaccination for hpv", 308, 0, 0.0, 2097.6558441558445, 916, 18200, 1581.5, 3175.3, 4559.6, 11093.110000000062, 0.10968770343863828, 130.79625602013658, 1.8576532391526694], "isController": true}, {"data": ["1.2 Sign-in page", 1322, 0, 0.0, 270.86308623297987, 15, 5480, 130.0, 588.8000000000006, 1096.4499999999966, 1925.08, 0.36843303645954245, 148.81264944512787, 1.8249931341200762], "isController": false}, {"data": ["7.1 Name search", 29, 0, 0.0, 6864.206896551723, 5054, 9095, 6702.0, 8037.0, 8743.5, 9095.0, 0.008369761034664087, 3.383176293737774, 0.036364886785272915], "isController": false}, {"data": ["2.4 Patient attending session", 844, 21, 2.4881516587677726, 1338.5829383886276, 168, 8185, 1044.0, 2415.0, 3162.0, 5138.399999999973, 0.3061417327404437, 124.71254863491257, 1.5551661808465183], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 7.124467329545455, 13.405539772727273], "isController": false}, {"data": ["1.1 Homepage", 1322, 0, 0.0, 293.18683812405436, 31, 11494, 138.0, 635.2000000000003, 1276.6499999999992, 2212.93, 0.3686323433333454, 148.94389565439073, 1.818190707338405], "isController": false}, {"data": ["1.3 Sign-in", 1322, 0, 0.0, 309.417549167927, 69, 6168, 143.5, 710.4000000000001, 1232.6499999999992, 1879.3899999999999, 0.368272104613792, 149.07919372818955, 1.9220753824548984], "isController": false}, {"data": ["Run some searches", 29, 0, 0.0, 10929.58620689655, 9357, 13805, 10831.0, 12566.0, 13595.0, 13805.0, 0.008320587054715892, 18.58956722385191, 0.1821064260109011], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 311, 0, 0.0, 2156.627009646302, 934, 18397, 1638.0, 3311.0, 4477.199999999999, 12715.919999999975, 0.11178095820362609, 134.11067178603687, 1.8938245530244298], "isController": true}, {"data": ["2.1 Open session", 1222, 0, 0.0, 664.1661211129284, 160, 14520, 476.0, 1188.0, 1658.5999999999985, 2800.7099999999996, 0.432798780796626, 174.2199587519652, 1.8010539171610027], "isController": false}, {"data": ["4.3 Vaccination confirm", 1222, 0, 0.0, 1556.6096563011495, 653, 19125, 1170.5, 2483.000000000001, 3225.85, 6978.239999999998, 0.4318923139072506, 174.47588581274834, 2.603542065343858], "isController": false}, {"data": ["4.1 Vaccination questions", 1222, 0, 0.0, 290.8240589198031, 83, 15644, 142.0, 538.5000000000002, 967.1499999999946, 2082.509999999999, 0.43171608202464246, 170.36912050699084, 2.4642415290291972], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1322, 0, 0.0, 1355.0121028744327, 619, 13372, 1028.0, 2238.4, 3177.2499999999923, 5426.57, 0.3683297693759708, 612.1349613769181, 7.058798929680915], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 307, 0, 0.0, 2042.3257328990226, 874, 15341, 1624.0, 3110.2, 4096.199999999986, 11130.800000000023, 0.10978039629650291, 131.23688758988047, 1.860108072452916], "isController": true}, {"data": ["7.0 Open Children Search", 30, 0, 0.0, 1489.7666666666662, 401, 2105, 1463.0, 1871.5000000000005, 2046.6999999999998, 2105.0, 0.008360581863055341, 4.057350099295844, 0.034741048046313165], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 29, 0, 0.0, 1660.3793103448274, 1387, 3282, 1539.0, 1960.0, 2921.5, 3282.0, 0.008382980814536667, 4.1641906724343025, 0.03689544751748141], "isController": false}, {"data": ["7.2 No Consent search", 29, 0, 0.0, 1916.137931034483, 1607, 3142, 1735.0, 2794.0, 3006.0, 3142.0, 0.00838541446790497, 4.401048187651696, 0.0368488364225393], "isController": false}, {"data": ["1.4 Open Sessions list", 1292, 0, 0.0, 492.7260061919512, 326, 3667, 420.0, 677.7, 888.0499999999997, 1525.3499999999997, 0.43797560353851744, 201.2899767412327, 1.8192555702903384], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1222, 0, 0.0, 245.98199672667766, 74, 9956, 126.0, 480.70000000000005, 805.6999999999998, 1587.4699999999998, 0.4316558452453744, 171.40853235378896, 2.243537368322007], "isController": false}, {"data": ["2.2 Session register", 1222, 0, 0.0, 210.42471358428804, 59, 4749, 105.0, 436.0, 695.7499999999986, 1595.5299999999966, 0.4328933785734073, 180.6025811151459, 1.8052488449460584], "isController": false}, {"data": ["7.3 Due vaccination", 29, 0, 0.0, 344.93103448275866, 252, 1301, 280.0, 534.0, 947.5, 1301.0, 0.008387572971884855, 3.390097920576047, 0.036620783057305054], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, 100.0, 0.14155712841253792], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14835, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 844, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
