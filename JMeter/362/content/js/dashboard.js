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

    var data = {"OkPercent": 99.97278699996113, "KoPercent": 0.027213000038875713};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6001740032969046, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.23186440677966103, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.888095238095238, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.8964817320703654, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3005050505050505, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.3203517587939699, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5964881163533168, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.203125, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.39072847682119205, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.7549435028248588, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6297412265154201, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6032705296836118, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.2484447900466563, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.2994011976047904, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.856081081081081, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5686680469289165, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8706365503080082, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.19338784216139354, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.3108108108108108, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.27494199535962877, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.0, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.19155844155844157, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6877887788778878, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8747433264887063, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.8861486486486486, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8419354838709677, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.21610169491525424, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 25723, 7, 0.027213000038875713, 1245.9696380671016, 0, 44508, 330.0, 3973.0, 6549.800000000003, 10908.610000000062, 6.907116561451937, 353.5704873311015, 82.95049993219892], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1475, 7, 0.4745762711864407, 2298.6854237288107, 527, 12865, 1639.0, 4489.8, 5337.6, 7198.120000000002, 0.4148093985966787, 64.40463728565251, 24.07687222288623], "isController": true}, {"data": ["2.5 Select patient", 1470, 0, 0.0, 362.5897959183677, 68, 4549, 112.0, 1351.900000000002, 1971.2500000000002, 3298.3199999999997, 0.4153045665703555, 11.133967576861716, 4.649702781777791], "isController": false}, {"data": ["7.1 Full name search", 144, 0, 0.0, 2408.2638888888896, 288, 13891, 1408.5, 6362.5, 7660.75, 12701.20000000003, 0.04133416346111618, 1.5981256558031014, 0.4697029372515824], "isController": false}, {"data": ["2.3 Search by first/last name", 1478, 0, 0.0, 355.79296346414066, 70, 5781, 110.0, 1029.30000000001, 2002.5999999999995, 3455.4100000000008, 0.41453172079185097, 13.028613399106822, 4.7514967745126935], "isController": false}, {"data": ["4.0 Vaccination for flu", 396, 0, 0.0, 1832.335858585859, 184, 7436, 1178.0, 3878.5, 4390.2, 6465.389999999999, 0.11335307852362768, 6.020028132441479, 4.927279453749081], "isController": true}, {"data": ["4.0 Vaccination for hpv", 398, 0, 0.0, 1712.9422110552764, 209, 7058, 1066.0, 3686.6000000000004, 4416.949999999999, 5603.599999999998, 0.11422323179997733, 5.630754210546707, 4.958761958193006], "isController": true}, {"data": ["1.2 Sign-in page", 2819, 0, 0.0, 1851.5594182334203, 14, 29251, 384.0, 5841.0, 8864.0, 11579.400000000034, 0.7823638155486413, 50.89143252819799, 10.388692539780106], "isController": false}, {"data": ["7.2 First name search", 128, 0, 0.0, 3530.3671874999986, 409, 16960, 2609.5, 8513.800000000001, 9928.75, 16502.959999999992, 0.03645654877815022, 4.9441106910894215, 0.4140240341577925], "isController": false}, {"data": ["7.7 Due vaccination search", 151, 0, 0.0, 1464.9470198675494, 855, 6201, 1084.0, 2874.2, 3727.200000000002, 5815.679999999992, 0.04550802628977582, 6.100075387266522, 0.5260079053054825], "isController": false}, {"data": ["2.4 Patient attending session", 1416, 7, 0.4943502824858757, 724.1278248587579, 156, 6002, 433.0, 1858.3999999999996, 2438.0499999999993, 4018.199999999997, 0.3984217322172648, 12.962047802061212, 5.397616427830518], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.080645161290322, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 2821, 0, 0.0, 1829.8762850053147, 29, 44508, 267.0, 5756.800000000006, 9015.700000000004, 12142.800000000003, 0.7834085129651193, 61.46728692784588, 10.390448493997107], "isController": false}, {"data": ["1.3 Sign-in", 2813, 0, 0.0, 1839.4987557767502, 72, 23870, 366.0, 5825.6, 8918.999999999996, 12217.660000000003, 0.7832137769892739, 51.138793960674896, 10.715376984624173], "isController": false}, {"data": ["Run some searches", 1286, 0, 0.0, 3698.754276827376, 0, 41964, 2388.5, 8971.6, 9968.699999999992, 15384.91, 0.3591303014655923, 42.11644523599762, 4.118279301234643], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 334, 0, 0.0, 1772.3203592814361, 625, 8625, 1167.0, 3638.5, 4488.25, 7366.149999999982, 0.10857166819067915, 5.491693612174524, 4.744368195173176], "isController": true}, {"data": ["2.1 Open session", 1480, 0, 0.0, 511.60067567567467, 127, 4620, 294.5, 1282.4000000000005, 2108.3500000000004, 3217.76, 0.41419618234259287, 9.217596705013397, 4.640778631276121], "isController": false}, {"data": ["4.3 Vaccination confirm", 1449, 0, 0.0, 957.8474810213934, 381, 6550, 590.0, 2353.0, 2944.5, 4445.0, 0.42084791706420677, 9.21691842254133, 6.685313032594802], "isController": false}, {"data": ["4.1 Vaccination questions", 1461, 0, 0.0, 414.9767282683099, 87, 3947, 137.0, 1432.3999999999999, 2044.6999999999996, 3248.1799999999985, 0.418907914807721, 5.843628264295484, 5.930345493299194], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 2813, 0, 0.0, 5914.543192321373, 304, 77064, 2533.0, 16584.6, 27318.399999999976, 34769.58000000008, 0.782243707429174, 198.02137436871988, 36.175147445413266], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 333, 0, 0.0, 1737.9339339339338, 635, 8704, 1043.0, 3665.000000000002, 4873.400000000001, 6530.620000000006, 0.10766590977208776, 5.818109887974106, 4.704957821152375], "isController": true}, {"data": ["7.0 Open Children Search", 1293, 0, 0.0, 3579.1423047177104, 78, 24080, 2206.0, 8930.2, 10154.399999999998, 14806.459999999997, 0.35988243283864574, 41.055519612879365, 4.0294110778311865], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 58.0, 58, 58, 58.0, 58.0, 58.0, 58.0, 17.241379310344826, 4.933324353448276, 10.641163793103448], "isController": false}, {"data": ["7.8 Year group search", 162, 0, 0.0, 4828.339506172841, 3904, 9306, 4218.5, 6396.200000000002, 7210.3, 8956.980000000003, 0.04553717421595246, 6.284485800975002, 0.5281003366658862], "isController": false}, {"data": ["7.9 DOB search", 142, 0, 0.0, 2599.232394366197, 1594, 8557, 2036.0, 4207.100000000003, 5750.549999999997, 8086.149999999992, 0.04040336212879055, 5.554570077728813, 0.4654030629269561], "isController": false}, {"data": ["7.4 Partial name search", 154, 0, 0.0, 5027.2467532467535, 308, 41964, 3611.5, 11750.0, 13788.25, 29865.64999999975, 0.044821970915197705, 6.061288462944745, 0.5089651104432281], "isController": false}, {"data": ["Debug Sampler", 1478, 0, 0.0, 0.28552097428958034, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.4145543932948772, 2.38012282900627, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1515, 0, 0.0, 751.0165016501647, 342, 4817, 516.0, 1566.400000000001, 2370.0000000000014, 3775.879999999985, 0.42297287110634624, 34.93037191905095, 4.73512807143914], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.05208333333333, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1461, 0, 0.0, 399.61738535249845, 75, 4194, 125.0, 1418.7999999999995, 2077.7999999999997, 3422.1399999999994, 0.41898624256808453, 6.717849767030314, 5.717877692276974], "isController": false}, {"data": ["7.5 Needs Consent search", 131, 0, 0.0, 9534.351145038163, 8119, 25207, 9019.0, 10742.0, 11989.2, 24030.040000000026, 0.038876302727098445, 5.335358410483752, 0.44969359825629396], "isController": false}, {"data": ["2.2 Session register", 1480, 0, 0.0, 372.79391891891856, 69, 4259, 113.0, 1295.2000000000007, 2030.850000000001, 3211.220000000002, 0.41419490724972624, 15.682213896529493, 4.644404729679052], "isController": false}, {"data": ["7.6 Needs triage search", 155, 0, 0.0, 531.167741935484, 172, 3692, 241.0, 1807.4, 2132.7999999999984, 3376.159999999999, 0.04560812848663108, 3.212567089465052, 0.527573865306544], "isController": false}, {"data": ["7.3 Last name search", 118, 0, 0.0, 4066.991525423729, 538, 16633, 2506.5, 10353.6, 11905.35, 16397.020000000004, 0.034350106179671436, 4.6709227874929224, 0.39015707532134086], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.027213000038875713], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 25723, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1416, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
