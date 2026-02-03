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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4610153256704981, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.23058252427184467, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.41585760517799353, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7944983818770227, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7605177993527508, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6140988372093024, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4318181818181818, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.20784883720930233, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48705501618122976, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49273255813953487, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.53125, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7006472491909385, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.1383495145631068, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8516, 0, 0.0, 926.0604744011259, 0, 14211, 766.0, 1794.0, 2205.1499999999996, 3410.2999999999993, 4.442823686781973, 1535.057960930241, 15.824166276041463], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 618, 0, 0.0, 1729.9935275080895, 1060, 9563, 1524.5, 2409.5000000000005, 2935.749999999999, 4337.239999999994, 0.3488732466720145, 140.549428768572, 1.8097650823112232], "isController": false}, {"data": ["4.1 Vaccination questions", 618, 0, 0.0, 1376.5372168284775, 537, 5265, 1279.0, 1648.4, 1817.999999999999, 3134.719999999972, 0.3481558724262239, 137.21079843834767, 1.7295864527578395], "isController": false}, {"data": ["Get Next Patient from STS", 688, 0, 0.0, 0.6584302325581392, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.3619330592181404, 0.14817477138508836, 0.23112872382035074], "isController": false}, {"data": ["2.0 Register attendance", 618, 0, 0.0, 4082.3527508090574, 1938, 16666, 3735.0, 5376.4, 6680.199999999999, 12040.719999999988, 0.3488027543000663, 599.5754197106362, 5.56561393235597], "isController": true}, {"data": ["1.0 Login", 688, 0, 0.0, 4198.319767441859, 2368, 15089, 4030.0, 5141.5, 5569.75, 8386.210000000001, 0.3608646484821655, 599.1985894578481, 5.9717646237055035], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 171, 0, 0.0, 3927.7719298245624, 3022, 7861, 3759.0, 4794.400000000001, 5146.800000000001, 7508.920000000001, 0.1001742798142968, 119.66824592492786, 1.4665522802829483], "isController": true}, {"data": ["2.5 Select patient", 618, 0, 0.0, 540.4482200647246, 333, 12199, 453.0, 710.4000000000001, 829.4999999999995, 1402.2199999999912, 0.34942319729010435, 141.8805474643071, 1.2420720504059926], "isController": false}, {"data": ["2.3 Search by first/last name", 618, 0, 0.0, 523.3592233009713, 329, 5261, 476.5, 687.9000000000002, 793.1999999999998, 1286.7599999999893, 0.34960327382534995, 141.6475102452003, 1.292726431054048], "isController": false}, {"data": ["4.0 Vaccination for flu", 144, 0, 0.0, 3979.590277777778, 2856, 8413, 3777.5, 4983.5, 5886.5, 7434.700000000024, 0.09256039405016644, 110.41798984876822, 1.3519243502774563], "isController": true}, {"data": ["4.0 Vaccination for hpv", 130, 0, 0.0, 4093.7769230769245, 3036, 12001, 3901.5, 5044.3, 5352.799999999999, 10151.229999999987, 0.09617226968775823, 114.52210273986474, 1.406765076482847], "isController": true}, {"data": ["1.2 Sign-in page", 688, 0, 0.0, 763.0087209302325, 212, 5048, 639.5, 1277.1, 1411.7499999999998, 2075.6300000000006, 0.3617334392595401, 144.93963778613352, 1.5287919468501587], "isController": false}, {"data": ["Debug Sampler", 618, 0, 0.0, 0.4627831715210359, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.3497682926553186, 2.035429696608549, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 132, 0, 0.0, 1283.3863636363633, 781, 9709, 1116.0, 1798.3000000000004, 2329.45, 7410.549999999913, 0.10977012306727661, 44.625865661119676, 0.48078027534837464], "isController": false}, {"data": ["1.4 Open Sessions list", 688, 0, 0.0, 1664.7732558139542, 825, 5285, 1631.5, 2318.4, 2577.75, 3507.9700000000003, 0.3616697366539662, 165.74857815956364, 1.2840715118452095], "isController": false}, {"data": ["4.2 Vaccination batch", 618, 0, 0.0, 898.2508090614886, 526, 3142, 845.0, 1137.4000000000003, 1308.1999999999998, 1767.5899999999979, 0.34855999038921964, 138.26334512314236, 1.559328308542145], "isController": false}, {"data": ["1.1 Homepage", 688, 0, 0.0, 797.4316860465118, 507, 5065, 754.5, 1078.3000000000002, 1184.1, 1571.0200000000011, 0.361380979594581, 144.63587378230892, 1.5153587696015038], "isController": false}, {"data": ["1.3 Sign-in", 688, 0, 0.0, 973.1061046511636, 429, 10255, 917.0, 1378.9, 1517.6499999999999, 2635.9000000000015, 0.3616704971497421, 145.12157038920054, 1.6559272670707947], "isController": false}, {"data": ["2.2 Session register", 618, 0, 0.0, 601.2637540453079, 317, 8665, 535.5, 827.0, 1000.2999999999997, 2505.669999999978, 0.3496028782838911, 144.14296790586886, 1.247849012428439], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 173, 0, 0.0, 4034.99421965318, 2987, 7712, 3759.0, 5233.4, 5550.099999999999, 7696.46, 0.09984861103656133, 119.3620654700633, 1.4616082180745609], "isController": true}, {"data": ["2.1 Open session", 618, 0, 0.0, 2142.0258899676433, 808, 14211, 1920.5, 3148.2000000000003, 3965.45, 7792.159999999971, 0.34928258600235906, 140.5390972763659, 1.243635916211177], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8516, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
