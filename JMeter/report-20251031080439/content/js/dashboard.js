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

    var data = {"OkPercent": 99.6108460959076, "KoPercent": 0.38915390409239264};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14211369095276222, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.018209408194233688, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.26417910447761195, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4069767441860465, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.26207386363636365, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.047400611620795105, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.10198300283286119, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.21888412017167383, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.3722786647314949, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3681159420289855, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7966, 31, 0.38915390409239264, 3523.6737383881396, 301, 31204, 1903.0, 11188.2, 12835.149999999996, 17347.749999999993, 4.398320179598994, 1783.577711402235, 18.23285117199276], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 638, 0, 0.0, 5626.481191222574, 2706, 23282, 4491.0, 9530.600000000002, 11970.299999999994, 19419.230000000003, 0.3895443369228806, 156.12003899564723, 2.0206658460591607], "isController": false}, {"data": ["4.1 Vaccination questions", 659, 0, 0.0, 2943.924127465857, 1281, 20706, 2328.0, 4842.0, 5998.0, 13960.399999999969, 0.3918471998087738, 153.23724321168578, 1.9466835982142114], "isController": false}, {"data": ["2.0 Register attendance", 675, 28, 4.148148148148148, 9174.4962962963, 3128, 33975, 7992.0, 14910.8, 18516.6, 26488.960000000003, 0.38744094395537604, 733.8911489286755, 6.725330173226281], "isController": true}, {"data": ["1.0 Login", 699, 1, 0.1430615164520744, 20587.572246065814, 6637, 51698, 18708.0, 27401.0, 31333.0, 46310.0, 0.388327508420707, 642.5424766631972, 6.42403232875118], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 161, 0, 0.0, 11058.962732919244, 3896, 31697, 9151.0, 17361.800000000003, 22369.7, 29427.799999999985, 0.09710465288102268, 114.91584754249082, 1.4153281164713012], "isController": true}, {"data": ["2.5 Select patient", 670, 0, 0.0, 1807.8701492537311, 722, 19623, 1469.0, 2887.199999999999, 4373.5999999999985, 9033.93999999999, 0.387616856357871, 156.26271076847357, 1.3777596186833638], "isController": false}, {"data": ["2.3 Search by first/last name", 688, 0, 0.0, 1358.370639534885, 723, 14983, 940.0, 2279.3000000000006, 3390.4999999999995, 8606.010000000006, 0.39289701586721454, 158.64943000397608, 1.4609106641130265], "isController": false}, {"data": ["4.0 Vaccination for flu", 165, 0, 0.0, 11434.703030303028, 4009, 50779, 9568.0, 17080.2, 22150.79999999999, 40291.60000000006, 0.0988451294511759, 115.45809459332867, 1.4252863925301837], "isController": true}, {"data": ["4.0 Vaccination for hpv", 164, 0, 0.0, 10996.310975609751, 4257, 31263, 9487.0, 17169.5, 20487.25, 29736.79999999999, 0.09805727022909527, 114.90598334140014, 1.4223290660732608], "isController": true}, {"data": ["1.2 Sign-in page", 704, 0, 0.0, 2309.0951704545478, 301, 25181, 1492.0, 4539.0, 6155.25, 13377.600000000008, 0.39188377528805407, 156.40353894724237, 1.6568703115893504], "isController": false}, {"data": ["2.4 Patient attending session", 471, 30, 6.369426751592357, 4210.1125265392775, 1009, 19752, 3296.0, 7420.4, 9683.599999999993, 14850.999999999969, 0.2702674787314987, 108.90332299890171, 1.1714005928885223], "isController": false}, {"data": ["1.4 Open Sessions list", 698, 1, 0.14326647564469913, 13523.030085959872, 10528, 31204, 12749.0, 16109.500000000002, 19236.75, 25815.62999999999, 0.3896567894066945, 178.15651863482657, 1.3818414981689482], "isController": false}, {"data": ["4.2 Vaccination batch", 654, 0, 0.0, 2825.0229357798166, 1250, 26105, 2042.5, 4969.5, 6639.0, 13854.350000000013, 0.3891624795005391, 152.9812167088309, 1.7410943937693542], "isController": false}, {"data": ["1.1 Homepage", 706, 0, 0.0, 2483.6033994334343, 1245, 14765, 1823.5, 4318.700000000013, 5985.099999999994, 10745.059999999963, 0.3930010192420202, 156.86529809176017, 1.648946372999995], "isController": false}, {"data": ["1.3 Sign-in", 699, 0, 0.0, 2287.589413447782, 880, 25454, 1613.0, 4036.0, 6826.0, 12691.0, 0.39069268303588894, 156.23092702965266, 1.7891562955877995], "isController": false}, {"data": ["2.2 Session register", 689, 0, 0.0, 1532.7721335268513, 723, 13718, 1020.0, 2781.0, 4206.0, 8955.100000000037, 0.39220173172149236, 163.08596640637762, 1.400135433939339], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 162, 0, 0.0, 11633.450617283945, 4183, 31176, 10249.5, 19309.900000000016, 21166.449999999997, 27885.510000000024, 0.09763047227836978, 115.40429550254231, 1.422783100873371], "isController": true}, {"data": ["2.1 Open session", 690, 0, 0.0, 1580.1115942028966, 772, 14357, 1157.0, 2550.7999999999997, 3935.499999999999, 8553.260000000017, 0.3911533581933023, 155.44132464456774, 1.3929579162211865], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 3.225806451612903, 0.012553351744915892], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 30, 96.7741935483871, 0.3766005523474768], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7966, 31, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 30, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 471, 30, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 698, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
