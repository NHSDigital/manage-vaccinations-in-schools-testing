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

    var data = {"OkPercent": 99.81919882479237, "KoPercent": 0.18080117520763886};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3735614027169743, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0010416666666666667, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4061224489795918, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0014005602240896359, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7966329966329966, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8196117804551539, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0013297872340425532, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5003326679973387, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.09237097980553478, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3233333333333333, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4734151329243354, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5278884462151394, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.47468354430379744, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7548430193720775, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.38525683789192794, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17699, 32, 0.18080117520763886, 1241.089948584664, 254, 24127, 928.0, 2342.0, 3138.0, 5749.0, 4.914082000394259, 1863.4418836842913, 23.559557501131412], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1440, 0, 0.0, 2957.1229166666685, 1496, 24127, 2446.0, 4616.8, 6014.350000000002, 9955.959999999995, 0.4168223720145459, 154.16083022251297, 2.492667379419656], "isController": false}, {"data": ["4.1 Vaccination questions", 1470, 0, 0.0, 1363.6102040816313, 494, 15607, 1143.0, 1889.4000000000005, 2325.7000000000003, 4320.819999999994, 0.4202916824276048, 153.14742689238832, 2.3817369097903947], "isController": false}, {"data": ["2.0 Register attendance", 1493, 32, 2.143335565974548, 5218.243804420622, 1751, 26460, 4659.0, 7733.4000000000015, 9701.699999999997, 16015.219999999987, 0.418395385040053, 776.3277489227474, 8.853709911511338], "isController": true}, {"data": ["1.0 Login", 1501, 0, 0.0, 4380.914723517659, 2063, 24951, 3887.0, 5711.2, 7628.999999999969, 12235.440000000004, 0.41795357011985607, 647.829550477326, 7.984147615054181], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 357, 0, 0.0, 5308.551820728295, 1280, 27788, 4602.0, 7886.599999999999, 11008.599999999999, 13996.880000000006, 0.10301083056449648, 113.57991175189105, 1.7216738362769808], "isController": true}, {"data": ["2.5 Select patient", 1485, 0, 0.0, 626.5030303030311, 254, 12824, 433.0, 1107.8000000000006, 1521.6000000000008, 2984.00000000001, 0.419874868806775, 157.3678679654525, 1.7302244149884867], "isController": false}, {"data": ["2.3 Search by first/last name", 1494, 0, 0.0, 561.8058902275766, 254, 4983, 423.0, 896.0, 1268.25, 2586.7999999999975, 0.41884851981624494, 157.8909497175541, 1.7946087669389743], "isController": false}, {"data": ["4.0 Vaccination for flu", 374, 0, 0.0, 5088.002673796794, 1632, 16281, 4610.0, 6893.0, 9233.5, 13388.25, 0.10703166563307656, 116.99616262011013, 1.7877426089841348], "isController": true}, {"data": ["4.0 Vaccination for hpv", 376, 0, 0.0, 4998.569148936169, 1487, 14878, 4505.5, 6858.1, 8760.849999999999, 11568.430000000004, 0.10784868829032866, 118.34896777412713, 1.7971205323465753], "isController": true}, {"data": ["1.2 Sign-in page", 1503, 0, 0.0, 1027.9807052561541, 292, 13445, 728.0, 1759.0000000000034, 2348.2, 4786.760000000004, 0.41802706245457816, 156.53470847079834, 2.0559309449469763], "isController": false}, {"data": ["2.4 Patient attending session", 1337, 32, 2.393418100224383, 2342.8713537771173, 469, 15121, 1943.0, 3632.8, 4552.9, 8743.899999999983, 0.37657845379759797, 145.30918769790085, 1.8978435906072546], "isController": false}, {"data": ["1.4 Open Sessions list", 1500, 0, 0.0, 1421.0879999999993, 723, 9584, 1245.5, 2031.7000000000003, 2366.8, 4155.860000000001, 0.4187384916704539, 180.09089837778615, 1.7250580990933473], "isController": false}, {"data": ["4.2 Vaccination batch", 1467, 0, 0.0, 901.6864349011574, 378, 6379, 726.0, 1364.6000000000001, 1751.9999999999986, 3371.3199999999983, 0.42011127364450396, 155.0816583681326, 2.166392001530242], "isController": false}, {"data": ["1.1 Homepage", 1506, 0, 0.0, 871.6128818061104, 366, 15316, 660.0, 1399.1999999999998, 1856.6999999999975, 4280.94000000003, 0.4183221780752513, 155.36586314946533, 2.04934910503081], "isController": false}, {"data": ["1.3 Sign-in", 1501, 0, 0.0, 1059.8141239173897, 367, 14242, 885.0, 1687.6, 2205.0999999999985, 4142.9400000000005, 0.4180511186557749, 156.38616585406996, 2.161014196087142], "isController": false}, {"data": ["2.2 Session register", 1497, 0, 0.0, 642.3954575818294, 259, 12652, 476.0, 1035.2, 1386.999999999999, 3062.039999999999, 0.4191070248720562, 161.48576776926646, 1.7337311688802535], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 357, 0, 0.0, 5320.969187675072, 1539, 29622, 4570.0, 7462.4, 9867.499999999993, 21112.060000000052, 0.1033177440266716, 113.59475975368701, 1.7300965587702872], "isController": true}, {"data": ["2.1 Open session", 1499, 0, 0.0, 1291.9386257505, 507, 17205, 1012.0, 2232.0, 2789.0, 5050.0, 0.4187702959719829, 156.59734033457065, 1.7286603389993038], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 32, 100.0, 0.18080117520763886], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17699, 32, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 32, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1337, 32, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 32, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
