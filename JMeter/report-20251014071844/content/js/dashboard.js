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

    var data = {"OkPercent": 99.89654361627086, "KoPercent": 0.10345638372913238};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.48382245189155837, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1562913907284768, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4102730819245774, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [3.2092426187419767E-4, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8368725868725869, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8081841432225064, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5270012706480305, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3826732673267327, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3662420382165605, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.474609375, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.48416719442685247, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.49840966921119595, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7396166134185304, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.48627075351213284, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21265, 22, 0.10345638372913238, 857.9318128379961, 0, 18118, 755.5, 1613.0, 1965.0, 3398.9100000000144, 5.905843660806555, 1995.7731709177435, 21.22104978618916], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1510, 0, 0.0, 2002.684105960266, 1008, 18118, 1693.0, 2983.8, 3863.8, 6169.130000000022, 0.4370706540632085, 171.02324307275578, 2.267137244563319], "isController": false}, {"data": ["4.1 Vaccination questions", 1538, 0, 0.0, 1428.6059817945409, 491, 11039, 1306.0, 1686.4000000000005, 2001.7499999999993, 3399.7599999999984, 0.43888573247546103, 167.93128044047447, 2.1815857302853128], "isController": false}, {"data": ["Get Next Patient from STS", 1569, 0, 0.0, 0.5863607393244104, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.4378986335832249, 0.18453870482129464, 0.2795634300287383], "isController": false}, {"data": ["2.0 Register attendance", 1558, 22, 1.4120667522464698, 3423.087291399227, 1490, 12724, 3217.0, 4816.400000000001, 5581.849999999999, 8176.680000000004, 0.43651849880223587, 802.1339995385806, 7.7896657051573905], "isController": true}, {"data": ["1.0 Login", 1572, 0, 0.0, 3956.8969465648843, 1624, 16242, 3735.0, 5003.4, 5737.699999999998, 7593.849999999995, 0.4376499201539458, 707.1330150905702, 7.273909052041782], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 383, 0, 0.0, 4392.475195822455, 2190, 15492, 3989.0, 5539.800000000001, 6815.599999999994, 12091.399999999985, 0.11001469830838757, 127.06816058880341, 1.6037956812337042], "isController": true}, {"data": ["2.5 Select patient", 1554, 0, 0.0, 522.914414414414, 311, 5309, 429.0, 810.5, 1104.5, 1693.4500000000028, 0.4385063919220012, 172.8282551639489, 1.5586443416344324], "isController": false}, {"data": ["2.3 Search by first/last name", 1564, 0, 0.0, 535.06074168798, 314, 6504, 451.0, 745.0, 977.0, 1827.9999999999945, 0.438268335673193, 173.27998062391237, 1.6206730328014705], "isController": false}, {"data": ["4.0 Vaccination for flu", 384, 0, 0.0, 4246.979166666667, 1969, 14928, 3931.5, 5481.0, 6687.75, 10557.999999999982, 0.10987379106640241, 126.30170918526653, 1.5923233172571383], "isController": true}, {"data": ["4.0 Vaccination for hpv", 388, 0, 0.0, 4301.386597938145, 2039, 20179, 3944.0, 5612.600000000001, 6219.149999999999, 9733.68000000001, 0.11102113693656059, 127.6244824833218, 1.6146585187977671], "isController": true}, {"data": ["1.2 Sign-in page", 1574, 0, 0.0, 884.507623888185, 216, 4919, 687.0, 1461.0, 1758.75, 2808.0, 0.4380952486983784, 170.79905406678824, 1.8714790077504448], "isController": false}, {"data": ["2.4 Patient attending session", 1010, 22, 2.1782178217821784, 1292.9980198019796, 324, 10298, 1109.0, 1954.9, 2489.7999999999997, 3553.89, 0.2836712906959468, 112.29983192212718, 1.2380179379610887], "isController": false}, {"data": ["Debug Sampler", 1558, 0, 0.0, 0.4717586649550698, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.43813938681858494, 2.8753435530938884, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1570, 0, 0.0, 1217.0955414012724, 480, 6776, 1068.5, 1767.0, 2004.1499999999987, 2871.7599999999984, 0.437898100275318, 195.63995663013284, 1.5560080124893], "isController": false}, {"data": ["4.2 Vaccination batch", 1536, 0, 0.0, 939.7382812500005, 511, 8011, 849.0, 1219.6, 1523.1999999999962, 2590.2799999999934, 0.4388552620488769, 169.07507533673072, 1.9648135659775745], "isController": false}, {"data": ["1.1 Homepage", 1579, 0, 0.0, 833.0354654844833, 478, 5135, 739.0, 1149.0, 1484.0, 2348.4000000000033, 0.4388361365300095, 170.9005862255166, 1.8664399248197825], "isController": false}, {"data": ["1.3 Sign-in", 1572, 0, 0.0, 1023.7137404580149, 428, 9640, 931.5, 1469.7, 1818.849999999999, 2953.4699999999953, 0.43812220599547386, 170.97490845890096, 1.9920501622229685], "isController": false}, {"data": ["2.2 Session register", 1565, 0, 0.0, 575.6728434504796, 305, 6834, 505.0, 812.0, 993.3999999999996, 1825.9599999999964, 0.4378093864653956, 174.4885211851486, 1.5642405174228555], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 381, 0, 0.0, 4406.09448818898, 2142, 15251, 4053.0, 5728.2, 6882.899999999992, 10312.200000000006, 0.11043836785426078, 127.69480017584992, 1.6096494586382224], "isController": true}, {"data": ["2.1 Open session", 1566, 0, 0.0, 953.7560664112378, 367, 7691, 822.5, 1462.3, 1736.8999999999992, 3140.669999999993, 0.4373778777285844, 169.3227117876166, 1.5588552934523472], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, 100.0, 0.10345638372913238], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21265, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1010, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
