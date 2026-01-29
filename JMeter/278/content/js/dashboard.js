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

    var data = {"OkPercent": 99.98128217126813, "KoPercent": 0.018717828731867104};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8256989774742483, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9814814814814815, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4214705882352941, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9952774498229043, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6481481481481481, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9938380281690141, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4853658536585366, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.49056603773584906, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.42592592592592593, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9870838117106774, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7236652236652237, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9873708381171068, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9847788627225732, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.47836538461538464, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7521942656524283, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5555555555555556, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5155109489051095, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9892150988615938, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3888888888888889, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.483917288914417, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4831325301204819, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.625, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8758036236119229, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9918918918918919, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9909037558685446, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21370, 4, 0.018717828731867104, 245.4502573701431, 0, 10825, 110.0, 597.0, 753.0, 1123.9900000000016, 5.718388244042721, 2245.1533113025203, 42.88592607559953], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 141.14814814814812, 81, 881, 94.0, 228.99999999999991, 656.9999999999989, 881.0, 0.007862637967455668, 3.340154569907151, 0.05778760210145016], "isController": false}, {"data": ["2.0 Register attendance", 1700, 4, 0.23529411764705882, 1147.794117647056, 477, 3956, 1103.0, 1651.0, 1880.9499999999962, 2351.3100000000004, 0.4758725613280763, 895.3582494279906, 15.375847309028142], "isController": true}, {"data": ["2.5 Select patient", 1694, 0, 0.0, 105.51593860684768, 58, 1319, 88.0, 137.0, 201.0, 475.14999999999804, 0.47829044201208376, 201.69481547119233, 3.4095699862053865], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 725.1851851851851, 241, 3465, 611.0, 1163.3999999999996, 2764.199999999996, 3465.0, 0.007858589627651291, 3.3693234037203434, 0.057337461445613754], "isController": false}, {"data": ["2.3 Search by first/last name", 1704, 0, 0.0, 111.37617370892008, 66, 1032, 93.0, 137.0, 205.75, 509.9000000000001, 0.4773820636576655, 203.2481295072368, 3.5301998916575243], "isController": false}, {"data": ["4.0 Vaccination for flu", 410, 0, 0.0, 924.160975609756, 191, 2414, 848.0, 1200.2000000000003, 1460.6999999999998, 1905.8399999999979, 0.11715343442436517, 144.72009991875336, 3.2906614970451615], "isController": true}, {"data": ["4.0 Vaccination for hpv", 424, 0, 0.0, 932.7452830188679, 191, 3350, 860.0, 1222.0, 1396.0, 1851.0, 0.1215503634183861, 150.1230924754233, 3.420488077923243], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1533.5185185185187, 444, 10825, 1061.0, 2573.999999999999, 7905.399999999984, 10825.0, 0.00785884581497541, 4.055776991624362, 0.05728475530901418], "isController": false}, {"data": ["1.2 Sign-in page", 1742, 0, 0.0, 134.76865671641835, 17, 4443, 100.0, 210.50000000000023, 347.8499999999999, 727.5399999999986, 0.4848930215209552, 203.244830940705, 4.069875244690741], "isController": false}, {"data": ["2.4 Patient attending session", 693, 4, 0.5772005772005772, 563.2900432900432, 209, 2073, 511.0, 727.8000000000001, 892.2999999999995, 1245.3799999999987, 0.19495765789741681, 83.38248850685221, 1.6901797490968087], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 1742, 0, 0.0, 129.89724454649829, 33, 4843, 100.0, 172.0, 276.8499999999999, 690.6899999999989, 0.48495511659662843, 203.05404348423338, 4.061704903367404], "isController": false}, {"data": ["1.3 Sign-in", 1741, 0, 0.0, 151.27685238368758, 65, 4447, 105.0, 296.5999999999999, 384.6999999999996, 737.7399999999998, 0.4848011633000228, 203.42055596569622, 4.230842900858302], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 7329.444444444444, 4251, 27014, 5948.0, 11440.599999999997, 22076.799999999974, 27014.0, 0.007871956504816325, 29.668703938576726, 0.4612152780207394], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 416, 0, 0.0, 961.7379807692308, 280, 2867, 883.5, 1328.6, 1504.0, 1830.5599999999995, 0.12003277818173425, 148.9507287176258, 3.378239225903997], "isController": true}, {"data": ["2.1 Open session", 1709, 0, 0.0, 564.275014628439, 117, 2004, 492.0, 937.0, 1076.0, 1522.900000000001, 0.47737283488793747, 200.22516794248327, 3.4059645696619367], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 966.6666666666669, 284, 5713, 749.0, 1784.9999999999995, 4354.599999999993, 5713.0, 0.00790321546711955, 4.073932918184011, 0.05760045691196198], "isController": false}, {"data": ["4.3 Vaccination confirm", 1644, 0, 0.0, 670.3436739659359, 460, 3123, 596.0, 912.0, 1089.75, 1479.8499999999988, 0.4768511119419588, 199.82200040954012, 4.859543200419304], "isController": false}, {"data": ["4.1 Vaccination questions", 1669, 0, 0.0, 145.5338526063509, 73, 1179, 115.0, 220.0, 316.5, 644.3, 0.4771825813776424, 195.57509901440284, 4.426748115875742], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1628.8518518518515, 698, 9312, 1029.0, 3464.2, 7067.599999999988, 9312.0, 0.007880696758669424, 4.074157468233495, 0.057443746327814224], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1741, 0, 0.0, 866.4681217690983, 269, 13733, 781.0, 1127.8, 1353.6999999999996, 1979.6399999999994, 0.4849487614447629, 837.7495267110043, 15.761049368901581], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 415, 0, 0.0, 928.6722891566257, 207, 2553, 838.0, 1261.8000000000002, 1485.0, 2128.559999999996, 0.11957924242659995, 147.54455095536252, 3.353963352690043], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 758.8571428571427, 236, 4415, 574.5, 1046.700000000001, 3153.199999999992, 4415.0, 0.007858804232415154, 4.014655012176937, 0.05601782627650136], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2120.444444444445, 1850, 3810, 1977.0, 2574.7999999999997, 3416.399999999998, 3810.0, 0.007853898864471668, 4.06196899826138, 0.05791511836989129], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 100.8888888888889, 78, 283, 92.0, 125.2, 220.19999999999965, 283.0, 0.007863123407353477, 3.340360791317801, 0.05792938887877685], "isController": false}, {"data": ["Debug Sampler", 1704, 0, 0.0, 0.29460093896713646, 0, 20, 0.0, 1.0, 1.0, 1.0, 0.47741710621353883, 2.750239106926022, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1711, 0, 0.0, 458.3693746347169, 317, 1791, 411.0, 604.8, 733.1999999999996, 978.8799999999999, 0.4771045581191986, 228.1915622052081, 3.4006893185777156], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1665, 0, 0.0, 129.3921921921919, 70, 1790, 102.0, 185.4000000000001, 269.39999999999964, 626.3799999999994, 0.4768538301243314, 196.78467488539042, 4.1802812514856935], "isController": false}, {"data": ["2.2 Session register", 1704, 0, 0.0, 136.86208920187767, 66, 1134, 93.0, 283.0, 352.0, 657.2500000000007, 0.47728953324220763, 208.08277795585494, 3.409557012150716], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 112.74074074074075, 74, 290, 94.0, 169.9999999999999, 290.0, 290.0, 0.007859326211231327, 3.338747691231961, 0.057655810141529], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 100.0, 0.018717828731867104], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21370, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 693, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
